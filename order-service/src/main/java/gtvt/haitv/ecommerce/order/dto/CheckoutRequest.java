package gtvt.haitv.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CheckoutRequest {
    @NotBlank private String shippingName;
    @NotBlank private String shippingPhone;
    @NotBlank private String shippingAddress;
    @NotBlank private String paymentMethod;
    private boolean simulatePaymentFailure;
}
