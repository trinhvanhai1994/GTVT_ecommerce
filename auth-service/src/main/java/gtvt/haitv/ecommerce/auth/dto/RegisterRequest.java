package gtvt.haitv.ecommerce.auth.dto;

import gtvt.haitv.ecommerce.common.constant.NumberConstant;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = NumberConstant.PASSWORD_MIN_LENGTH, max = NumberConstant.PASSWORD_MAX_LENGTH)
    private String password;

    @NotBlank
    @Size(max = 255)
    private String fullName;
}
