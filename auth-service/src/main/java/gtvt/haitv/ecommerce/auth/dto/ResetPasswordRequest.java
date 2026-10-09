package gtvt.haitv.ecommerce.auth.dto;

import gtvt.haitv.ecommerce.common.constant.NumberConstant;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = NumberConstant.PASSWORD_MIN_LENGTH, max = NumberConstant.PASSWORD_MAX_LENGTH)
    private String newPassword;
}
