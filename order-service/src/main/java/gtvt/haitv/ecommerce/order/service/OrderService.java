package gtvt.haitv.ecommerce.order.service;

import feign.FeignException;
import gtvt.haitv.ecommerce.common.event.OrderEvent;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.order.client.CartClient;
import gtvt.haitv.ecommerce.order.client.InventoryClient;
import gtvt.haitv.ecommerce.order.client.PaymentClient;
import gtvt.haitv.ecommerce.order.client.ProductClient;
import gtvt.haitv.ecommerce.order.domain.Order;
import gtvt.haitv.ecommerce.order.domain.OrderItem;
import gtvt.haitv.ecommerce.order.dto.CheckoutRequest;
import gtvt.haitv.ecommerce.order.dto.OrderResponse;
import gtvt.haitv.ecommerce.order.messaging.OrderEventPublisher;
import gtvt.haitv.ecommerce.order.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
public class OrderService {

    private static final Set<String> CANCELLABLE = Set.of("PENDING", "PAYMENT_PENDING", "CONFIRMED");
    private static final Set<String> ADMIN_STATUSES = Set.of(
            "PENDING", "PAYMENT_PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED", "PAYMENT_FAILED");

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final OrderEventPublisher eventPublisher;

    public OrderService(OrderRepository orderRepository, CartClient cartClient, ProductClient productClient,
                        InventoryClient inventoryClient, PaymentClient paymentClient, OrderEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.cartClient = cartClient;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
        this.paymentClient = paymentClient;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        FlowLog f = FlowLog.start("checkout");
        try {
            f.step("cart");
            CartClient.RemoteCart cart = cartClient.getCart(userId).getData();
            if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "CART_EMPTY", "Cart is empty");
            }
            f.step("items=" + cart.getItems().size());

            Order order = new Order();
            order.setUserId(userId);
            order.setStatus("PAYMENT_PENDING");
            order.setShippingName(request.getShippingName());
            order.setShippingPhone(request.getShippingPhone());
            order.setShippingAddress(request.getShippingAddress());
            order.setPaymentMethod(request.getPaymentMethod());
            BigDecimal total = BigDecimal.ZERO;
            InventoryClient.StockItemsRequest stockReq = new InventoryClient.StockItemsRequest();

            for (CartClient.RemoteItem cartItem : cart.getItems()) {
                ProductClient.RemoteProduct product = productClient.getProduct(cartItem.getProductId()).getData();
                if (product == null || !"ACTIVE".equals(product.getStatus())) {
                    throw new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found");
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
            f.step("products ok total=" + total);

            InventoryClient.CheckResponse check = inventoryClient.check(stockReq).getData();
            if (check == null || !check.isAvailable()) {
                throw new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK", "Not enough stock");
            }
            f.step("stock ok");

            orderRepository.save(order);
            inventoryClient.reserve(stockReq);
            f.step("saved+reserve orderId=" + order.getId());
            eventPublisher.publishAfterCommit(new OrderEvent(OrderEvent.ORDER_CREATED, userId, order.getId(),
                    "Order created", "Order #" + order.getId() + " created"));

            PaymentClient.CreatePaymentRequest payReq = new PaymentClient.CreatePaymentRequest();
            payReq.setOrderId(order.getId());
            payReq.setUserId(userId);
            payReq.setAmount(total);
            payReq.setMethod(request.getPaymentMethod());
            payReq.setSimulateFailure(request.isSimulatePaymentFailure());

            PaymentClient.RemotePayment payment;
            try {
                f.step("payment");
                payment = paymentClient.charge(payReq).getData();
            } catch (FeignException ex) {
                compensate(order, stockReq, null);
                f.fail("PAYMENT_SERVICE_ERROR");
                throw new ApiException(HttpStatus.BAD_GATEWAY, "PAYMENT_SERVICE_ERROR", "Payment service unavailable");
            }

            if (payment != null && "SUCCESS".equals(payment.getStatus())) {
                inventoryClient.deduct(stockReq);
                order.setStatus("CONFIRMED");
                cartClient.clearCart(userId);
                eventPublisher.publishAfterCommit(new OrderEvent(OrderEvent.PAYMENT_SUCCESS, userId, order.getId(),
                        "Payment success", "Payment succeeded for order #" + order.getId()));
                eventPublisher.publishAfterCommit(new OrderEvent(OrderEvent.ORDER_CONFIRMED, userId, order.getId(),
                        "Order confirmed", "Order #" + order.getId() + " confirmed"));
                OrderResponse response = OrderResponse.from(order);
                response.setPayment(new OrderResponse.PaymentSnapshot(payment.getId(), payment.getStatus()));
                f.end("CONFIRMED orderId=" + order.getId());
                return response;
            }
            f.step("payment FAIL compensate");
            compensate(order, stockReq, payment);
            OrderResponse response = OrderResponse.from(order);
            if (payment != null) {
                response.setPayment(new OrderResponse.PaymentSnapshot(payment.getId(), payment.getStatus()));
            }
            f.end("PAYMENT_FAILED orderId=" + order.getId());
            return response;
        } catch (RuntimeException e) {
            if (!(e instanceof ApiException api && "PAYMENT_SERVICE_ERROR".equals(api.getCode()))) {
                f.fail(e);
            }
            throw e;
        }
    }

    private void compensate(Order order, InventoryClient.StockItemsRequest stockReq, PaymentClient.RemotePayment payment) {
        try {
            inventoryClient.release(stockReq);
        } catch (Exception ex) {
            FlowLog.start("compensate").fail("release " + order.getId());
        }
        order.setStatus("PAYMENT_FAILED");
        eventPublisher.publishAfterCommit(new OrderEvent(OrderEvent.PAYMENT_FAILED, order.getUserId(), order.getId(),
                "Payment failed", "Payment failed for order #" + order.getId()));
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
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
            }
            if (!CANCELLABLE.contains(order.getStatus())) {
                throw new ApiException(HttpStatus.CONFLICT, "ORDER_NOT_CANCELLABLE", "Order cannot be cancelled");
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
                throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid status");
            }
            Order order = order(id);
            order.setStatus(status);
            f.step(status);
            if ("SHIPPING".equals(status)) {
                eventPublisher.publishAfterCommit(new OrderEvent(OrderEvent.ORDER_SHIPPED, order.getUserId(), order.getId(),
                        "Order shipped", "Order #" + order.getId() + " shipped"));
            }
            if ("DELIVERED".equals(status)) {
                eventPublisher.publishAfterCommit(new OrderEvent(OrderEvent.ORDER_DELIVERED, order.getUserId(), order.getId(),
                        "Order delivered", "Order #" + order.getId() + " delivered"));
            }
            f.end("id=" + id);
            return OrderResponse.from(order);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    private InventoryClient.StockItemsRequest toStock(Order order) {
        InventoryClient.StockItemsRequest req = new InventoryClient.StockItemsRequest();
        order.getItems().forEach(i -> req.getItems().add(new InventoryClient.Item(i.getProductId(), i.getQuantity())));
        return req;
    }

    private Order order(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND", "Order not found"));
    }
}
