package gtvt.haitv.ecommerce.order.dto;

import gtvt.haitv.ecommerce.order.entity.Order;
import gtvt.haitv.ecommerce.order.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private String status;
    private BigDecimal totalAmount;
    private String customerEmail;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String paymentMethod;
    private List<Item> items;
    private PaymentSnapshot payment;

    public static OrderResponse from(Order order) {
        OrderResponse r = new OrderResponse();
        r.id = order.getId();
        r.userId = order.getUserId();
        r.status = order.getStatus();
        r.totalAmount = order.getTotalAmount();
        r.customerEmail = order.getCustomerEmail();
        r.shippingName = order.getShippingName();
        r.shippingPhone = order.getShippingPhone();
        r.shippingAddress = order.getShippingAddress();
        r.paymentMethod = order.getPaymentMethod();
        r.items = order.getItems().stream().map(Item::from).toList();
        return r;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Item {
        private Long productId;
        private String productName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;

        public static Item from(OrderItem i) {
            Item r = new Item();
            r.productId = i.getProductId();
            r.productName = i.getProductName();
            r.quantity = i.getQuantity();
            r.unitPrice = i.getUnitPrice();
            r.subtotal = i.getSubtotal();
            return r;
        }
    }

    @Getter
    @AllArgsConstructor
    public static class PaymentSnapshot {
        private Long id;
        private String status;
    }
}
