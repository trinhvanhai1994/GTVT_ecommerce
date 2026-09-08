package gtvt.haitv.ecommerce.payment.dto;

import gtvt.haitv.ecommerce.payment.domain.Payment;

import java.math.BigDecimal;

public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String method;
    private String status;
    private String failureReason;

    public static PaymentResponse from(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.id = p.getId();
        r.orderId = p.getOrderId();
        r.userId = p.getUserId();
        r.amount = p.getAmount();
        r.method = p.getMethod();
        r.status = p.getStatus();
        r.failureReason = p.getFailureReason();
        return r;
    }
    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Long getUserId() { return userId; }
    public BigDecimal getAmount() { return amount; }
    public String getMethod() { return method; }
    public String getStatus() { return status; }
    public String getFailureReason() { return failureReason; }
}
