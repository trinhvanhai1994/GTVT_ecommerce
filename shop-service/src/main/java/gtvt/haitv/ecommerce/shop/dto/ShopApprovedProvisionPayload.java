package gtvt.haitv.ecommerce.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShopApprovedProvisionPayload {
    private String contactEmail;
    private String shopName;
    private Long shopId;
    private String slug;
}
