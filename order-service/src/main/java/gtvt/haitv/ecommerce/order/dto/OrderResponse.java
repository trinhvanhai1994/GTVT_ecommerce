package gtvt.haitv.ecommerce.order.dto;

import gtvt.haitv.ecommerce.order.domain.Order;
import gtvt.haitv.ecommerce.order.domain.OrderItem;

import java.math.BigDecimal;
import java.util.List;

public class OrderResponse {
    private Long id;
    private Long userId;
    private String status;
    private BigDecimal totalAmount;
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
        r.shippingName = order.getShippingName();
        r.shippingPhone = order.getShippingPhone();
        r.shippingAddress = order.getShippingAddress();
        r.paymentMethod = order.getPaymentMethod();
        r.items = order.getItems().stream().map(Item::from).toList();
        return r;
    }

    public void setPayment(PaymentSnapshot payment) { this.payment = payment; }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getShippingName() { return shippingName; }
    public String getShippingPhone() { return shippingPhone; }
    public String getShippingAddress() { return shippingAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public List<Item> getItems() { return items; }
    public PaymentSnapshot getPayment() { return payment; }

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
        public Long getProductId() { return productId; }
        public String getProductName() { return productName; }
        public int getQuantity() { return quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public BigDecimal getSubtotal() { return subtotal; }
    }

    public static class PaymentSnapshot {
        private Long id;
        private String status;
        public PaymentSnapshot(Long id, String status) { this.id = id; this.status = status; }
        public Long getId() { return id; }
        public String getStatus() { return status; }
    }
}
