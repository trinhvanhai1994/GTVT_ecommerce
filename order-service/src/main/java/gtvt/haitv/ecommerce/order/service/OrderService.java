package gtvt.haitv.ecommerce.order.service;

import feign.FeignException;
import gtvt.haitv.ecommerce.common.event.OrderEvent;
import gtvt.haitv.ecommerce.common.constant.AppConstant;
import gtvt.haitv.ecommerce.common.constant.ErrorConstant;
import gtvt.haitv.ecommerce.common.constant.MessageConstant;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.order.client.CartClient;
import gtvt.haitv.ecommerce.order.client.InventoryClient;
import gtvt.haitv.ecommerce.order.client.PaymentClient;
import gtvt.haitv.ecommerce.order.client.ProductClient;
import gtvt.haitv.ecommerce.order.client.ShopClient;
import gtvt.haitv.ecommerce.order.entity.Order;
import gtvt.haitv.ecommerce.order.entity.OrderItem;
import gtvt.haitv.ecommerce.order.dto.CheckoutRequest;
import gtvt.haitv.ecommerce.order.dto.OrderResponse;
import gtvt.haitv.ecommerce.order.dto.SellerStatsResponse;
import gtvt.haitv.ecommerce.order.messaging.OrderEventPublisher;
import gtvt.haitv.ecommerce.order.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Set<String> CANCELLABLE = Set.of(AppConstant.ORDER_PENDING, AppConstant.ORDER_PAYMENT_PENDING, AppConstant.ORDER_CONFIRMED);
    private static final Set<String> ADMIN_STATUSES = Set.of(
            AppConstant.ORDER_PENDING, AppConstant.ORDER_PAYMENT_PENDING, AppConstant.ORDER_CONFIRMED, AppConstant.ORDER_PROCESSING,
            AppConstant.ORDER_SHIPPING, AppConstant.ORDER_DELIVERED, AppConstant.ORDER_CANCELLED, AppConstant.ORDER_PAYMENT_FAILED);
    private static final Set<String> SELLER_FULFILLMENT_STATUSES = Set.of(
            AppConstant.ORDER_PROCESSING, AppConstant.ORDER_SHIPPING, AppConstant.ORDER_DELIVERED);
    private static final Set<String> REVENUE_STATUSES = Set.of(
            AppConstant.ORDER_CONFIRMED, AppConstant.ORDER_PROCESSING, AppConstant.ORDER_SHIPPING, AppConstant.ORDER_DELIVERED);
    private static final Set<String> OPEN_ORDER_STATUSES = Set.of(
            AppConstant.ORDER_PENDING, AppConstant.ORDER_PAYMENT_PENDING, AppConstant.ORDER_CONFIRMED,
            AppConstant.ORDER_PROCESSING, AppConstant.ORDER_SHIPPING);

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final ShopClient shopClient;
    private final OrderEventPublisher eventPublisher;

    public OrderService(OrderRepository orderRepository, CartClient cartClient, ProductClient productClient,
                        InventoryClient inventoryClient, PaymentClient paymentClient, ShopClient shopClient,
                        OrderEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.cartClient = cartClient;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
        this.paymentClient = paymentClient;
        this.shopClient = shopClient;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public List<OrderResponse> checkout(Long userId, String customerEmail, CheckoutRequest request) {
        FlowLog f = FlowLog.start("checkout");
        try {
            CartClient.RemoteCart cart = cartClient.getCart(userId).getData();
            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.CART_EMPTY, MessageConstant.CART_EMPTY);
            }
            Map<Long, List<CartClient.RemoteItem>> byShop = cart.getItems().stream()
                    .collect(Collectors.groupingBy(item -> {
                        Long shopId = item.getShopId();
                        if (shopId == null) {
                            ProductClient.RemoteProduct p = productClient.getProduct(item.getProductId()).getData();
                            if (p == null || p.getShopId() == null) {
                                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, "Missing shopId on cart item");
                            }
                            return p.getShopId();
                        }
                        return shopId;
                    }, LinkedHashMap::new, Collectors.toList()));

            List<OrderResponse> results = new ArrayList<>();
            boolean anySuccess = false;
            for (Map.Entry<Long, List<CartClient.RemoteItem>> entry : byShop.entrySet()) {
                results.add(checkoutOneShop(userId, customerEmail, request, entry.getKey(), entry.getValue()));
                if ("CONFIRMED".equals(results.get(results.size() - 1).getStatus())) {
                    anySuccess = true;
                }
            }
            if (anySuccess) {
                try {
                    cartClient.clearCart(userId);
                } catch (Exception ignored) {
                    // best-effort
                }
            }
            f.end("orders=" + results.size());
            return results;
        } catch (RuntimeException e) {
            if (!(e instanceof ApiException api && ErrorConstant.PAYMENT_SERVICE_ERROR.equals(api.getCode()))) {
                f.fail(e);
            }
            throw e;
        }
    }

    private OrderResponse checkoutOneShop(Long userId, String customerEmail, CheckoutRequest request,
                                          Long shopId, List<CartClient.RemoteItem> items) {
        String shopName = "Shop #" + shopId;
        try {
            ShopClient.RemoteShop shop = shopClient.getById(shopId).getData();
            if (shop != null && shop.getName() != null) {
                shopName = shop.getName();
            }
            if (shop != null && !AppConstant.SHOP_APPROVED.equals(shop.getStatus())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, "Shop is not approved");
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ignored) {
            // keep default name
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setShopId(shopId);
        order.setShopName(shopName);
        order.setCustomerEmail(customerEmail);
        order.setStatus(AppConstant.ORDER_PAYMENT_PENDING);
        order.setShippingName(request.getShippingName());
        order.setShippingPhone(request.getShippingPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        BigDecimal total = BigDecimal.ZERO;
        InventoryClient.StockItemsRequest stockReq = new InventoryClient.StockItemsRequest();

        for (CartClient.RemoteItem cartItem : items) {
            ProductClient.RemoteProduct product = productClient.getProduct(cartItem.getProductId()).getData();
            if (product == null || !AppConstant.STATUS_ACTIVE.equals(product.getStatus())) {
                throw new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.PRODUCT_NOT_FOUND, MessageConstant.PRODUCT_NOT_FOUND);
            }
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setQuantity(cartItem.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            order.getItems().add(item);
            total = total.add(item.getSubtotal());
            stockReq.getItems().add(new InventoryClient.Item(product.getId(), cartItem.getQuantity()));
        }
        order.setTotalAmount(total);

        InventoryClient.CheckResponse check = inventoryClient.check(stockReq).getData();
        if (check == null || !check.isAvailable()) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorConstant.INSUFFICIENT_STOCK, MessageConstant.INSUFFICIENT_STOCK);
        }

        orderRepository.save(order);
        inventoryClient.reserve(stockReq);
        publish(order, OrderEvent.ORDER_CREATED, "Order created", "Order #" + order.getId() + " created");

        PaymentClient.CreatePaymentRequest payReq = new PaymentClient.CreatePaymentRequest();
        payReq.setOrderId(order.getId());
        payReq.setUserId(userId);
        payReq.setAmount(total);
        payReq.setMethod(request.getPaymentMethod());
        payReq.setSimulateFailure(request.isSimulatePaymentFailure());

        PaymentClient.RemotePayment payment;
        try {
            payment = paymentClient.charge(payReq).getData();
        } catch (FeignException ex) {
            compensate(order, stockReq, null);
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorConstant.PAYMENT_SERVICE_ERROR, MessageConstant.PAYMENT_SERVICE_ERROR);
        }

        if (payment != null && "SUCCESS".equals(payment.getStatus())) {
            inventoryClient.deduct(stockReq);
            order.setStatus("CONFIRMED");
            publish(order, OrderEvent.PAYMENT_SUCCESS, "Payment success",
                    "Payment succeeded for order #" + order.getId());
            publish(order, OrderEvent.ORDER_CONFIRMED, "Order confirmed",
                    "Order #" + order.getId() + " confirmed. Total: " + order.getTotalAmount());
            OrderResponse response = OrderResponse.from(order);
            response.setPayment(new OrderResponse.PaymentSnapshot(payment.getId(), payment.getStatus()));
            return response;
        }
        compensate(order, stockReq, payment);
        OrderResponse response = OrderResponse.from(order);
        if (payment != null) {
            response.setPayment(new OrderResponse.PaymentSnapshot(payment.getId(), payment.getStatus()));
        }
        return response;
    }

    private void compensate(Order order, InventoryClient.StockItemsRequest stockReq, PaymentClient.RemotePayment payment) {
        try {
            inventoryClient.release(stockReq);
        } catch (Exception ex) {
            FlowLog.start("compensate").fail("release " + order.getId());
        }
        order.setStatus(AppConstant.ORDER_PAYMENT_FAILED);
        publish(order, OrderEvent.PAYMENT_FAILED, "Payment failed",
                "Payment failed for order #" + order.getId());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(Long userId) {
        FlowLog f = FlowLog.start("myOrders");
        var list = orderRepository.findByUserIdOrderByIdDesc(userId).stream().map(OrderResponse::from).toList();
        f.end("n=" + list.size());
        return list;
    }

    @Transactional(readOnly = true)
    public OrderResponse get(Long id) {
        FlowLog f = FlowLog.start("getOrder");
        try {
            Order order = order(id);
            SecurityUtils.requireOwnerOrAdmin(order.getUserId());
            f.end("id=" + id + " " + order.getStatus());
            return OrderResponse.from(order);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public OrderResponse cancel(Long id, Long userId) {
        FlowLog f = FlowLog.start("cancel");
        try {
            Order order = order(id);
            if (!order.getUserId().equals(userId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, ErrorConstant.FORBIDDEN, MessageConstant.FORBIDDEN);
            }
            if (!CANCELLABLE.contains(order.getStatus())) {
                throw new ApiException(HttpStatus.CONFLICT, ErrorConstant.ORDER_NOT_CANCELLABLE, MessageConstant.ORDER_NOT_CANCELLABLE);
            }
            InventoryClient.StockItemsRequest stockReq = toStock(order);
            f.step("status=" + order.getStatus());
            if ("CONFIRMED".equals(order.getStatus())) {
                try {
                    inventoryClient.release(newReleaseAsAvailable(order));
                } catch (Exception ex) {
                    f.step("restore stock warn");
                }
            } else {
                try {
                    inventoryClient.release(stockReq);
                } catch (Exception ex) {
                    f.step("release reserved warn");
                }
            }
            order.setStatus("CANCELLED");
            publish(order, OrderEvent.ORDER_CANCELLED, "Order cancelled",
                    "Order #" + order.getId() + " was cancelled");
            f.end("id=" + id);
            return OrderResponse.from(order);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    private InventoryClient.StockItemsRequest newReleaseAsAvailable(Order order) {
        return toStock(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> sellerOrders(Long shopId) {
        requireShopMember(shopId);
        return orderRepository.findByShopIdOrderByIdDesc(shopId).stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SellerStatsResponse sellerStats(Long shopId, int days) {
        requireShopMember(shopId);
        int window = Math.min(Math.max(days, 1), 90);
        Instant after = Instant.now().minusSeconds((long) window * 86400L);
        List<Order> inWindow = orderRepository.findByShopIdAndCreatedAtAfterOrderByCreatedAtAsc(shopId, after);

        SellerStatsResponse stats = new SellerStatsResponse();
        SellerStatsResponse.Summary summary = stats.getSummary();
        summary.setOrderCount(inWindow.size());
        summary.setRevenue(inWindow.stream()
                .filter(o -> REVENUE_STATUSES.contains(o.getStatus()))
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.setOpenOrders(inWindow.stream().filter(o -> OPEN_ORDER_STATUSES.contains(o.getStatus())).count());
        summary.setCancelledCount(inWindow.stream().filter(o -> AppConstant.ORDER_CANCELLED.equals(o.getStatus())).count());

        Map<LocalDate, List<Order>> byDay = inWindow.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(o -> LocalDate.ofInstant(o.getCreatedAt(), ZoneOffset.UTC), LinkedHashMap::new, Collectors.toList()));

        LocalDate start = LocalDate.now(ZoneOffset.UTC).minusDays(window - 1L);
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        List<SellerStatsResponse.DayPoint> series = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            List<Order> dayOrders = byDay.getOrDefault(d, List.of());
            BigDecimal dayRev = dayOrders.stream()
                    .filter(o -> REVENUE_STATUSES.contains(o.getStatus()))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            series.add(new SellerStatsResponse.DayPoint(d.toString(), dayOrders.size(), dayRev));
        }
        stats.setSeries(series);
        return stats;
    }

    @Transactional(readOnly = true)
    public OrderResponse sellerGet(Long id, Long shopId) {
        requireShopMember(shopId);
        Order order = order(id);
        if (!shopId.equals(order.getShopId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorConstant.FORBIDDEN, MessageConstant.FORBIDDEN);
        }
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse sellerStatus(Long id, Long shopId, String status) {
        requireShopMember(shopId);
        if (!SELLER_FULFILLMENT_STATUSES.contains(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, MessageConstant.INVALID_STATUS);
        }
        Order order = order(id);
        if (!shopId.equals(order.getShopId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorConstant.FORBIDDEN, MessageConstant.FORBIDDEN);
        }
        order.setStatus(status);
        String eventType = switch (status) {
            case "SHIPPING" -> OrderEvent.ORDER_SHIPPED;
            case "DELIVERED" -> OrderEvent.ORDER_DELIVERED;
            default -> OrderEvent.ORDER_STATUS_UPDATED;
        };
        publish(order, eventType, "Order status: " + status, "Order #" + order.getId() + " is now " + status);
        return OrderResponse.from(order);
    }

    private void requireShopMember(Long shopId) {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        Long userId = SecurityUtils.currentUserId();
        var member = shopClient.member(shopId, userId).getData();
        if (member == null || !Boolean.TRUE.equals(member.get("member"))) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorConstant.FORBIDDEN, MessageConstant.FORBIDDEN);
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> adminList() {
        FlowLog f = FlowLog.start("adminListOrders");
        var list = orderRepository.findAll().stream().map(OrderResponse::from).toList();
        f.end("n=" + list.size());
        return list;
    }

    @Transactional
    public OrderResponse adminStatus(Long id, String status) {
        FlowLog f = FlowLog.start("adminStatus");
        try {
            if (!ADMIN_STATUSES.contains(status)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, MessageConstant.INVALID_STATUS);
            }
            Order order = order(id);
            order.setStatus(status);
            f.step(status);
            String eventType = switch (status) {
                case "SHIPPING" -> OrderEvent.ORDER_SHIPPED;
                case "DELIVERED" -> OrderEvent.ORDER_DELIVERED;
                case "CANCELLED" -> OrderEvent.ORDER_CANCELLED;
                default -> OrderEvent.ORDER_STATUS_UPDATED;
            };
            publish(order, eventType, "Order status: " + status,
                    "Order #" + order.getId() + " is now " + status);
            f.end("id=" + id);
            return OrderResponse.from(order);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    private void publish(Order order, String eventType, String title, String message) {
        eventPublisher.publishAfterCommit(new OrderEvent(
                eventType, order.getUserId(), order.getId(), order.getCustomerEmail(), title, message));
    }

    private InventoryClient.StockItemsRequest toStock(Order order) {
        InventoryClient.StockItemsRequest req = new InventoryClient.StockItemsRequest();
        order.getItems().forEach(i -> req.getItems().add(new InventoryClient.Item(i.getProductId(), i.getQuantity())));
        return req;
    }

    private Order order(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.ORDER_NOT_FOUND, MessageConstant.ORDER_NOT_FOUND));
    }
}
