package gtvt.haitv.ecommerce.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CreatePaymentRequest {
    @NotNull private Long orderId;
    @NotNull private Long userId;
    @NotNull @DecimalMin("0.01") private BigDecimal amount;
    @NotBlank private String method;
    private boolean simulateFailure;
}
