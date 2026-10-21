package gtvt.haitv.ecommerce.shop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShopRequest {
    @NotBlank
    @Size(max = 255)
    private String name;
    @NotBlank
    @Size(max = 64)
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "slug must be lowercase kebab-case")
    private String slug;
    @Size(max = 2000)
    private String description;
    @Size(max = 512)
    private String logoUrl;
    @NotBlank
    @Email
    @Size(max = 255)
    private String contactEmail;
}
