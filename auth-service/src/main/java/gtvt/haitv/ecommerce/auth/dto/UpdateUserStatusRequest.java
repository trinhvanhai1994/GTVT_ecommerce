package gtvt.haitv.ecommerce.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateUserStatusRequest {

    @NotBlank
    private String status;
}
