package gtvt.haitv.ecommerce.payment.dto;

import gtvt.haitv.ecommerce.payment.entity.Payment;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
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
}
