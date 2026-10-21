package gtvt.haitv.ecommerce.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShopApprovedProvisionRequest {
    @NotBlank
    @Email
    private String contactEmail;
    @NotBlank
    private String shopName;
    @NotNull
    private Long shopId;
    @NotBlank
    private String slug;
}
