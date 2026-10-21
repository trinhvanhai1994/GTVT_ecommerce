package gtvt.haitv.ecommerce.shop.dto;

import gtvt.haitv.ecommerce.shop.entity.Shop;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ShopResponse {
    private Long id;
    private Long ownerUserId;
    private String slug;
    private String name;
    private String description;
    private String logoUrl;
    private String contactEmail;
    private String status;
    private String rejectReason;

    public static ShopResponse from(Shop s) {
        ShopResponse r = new ShopResponse();
        r.id = s.getId();
        r.ownerUserId = s.getOwnerUserId();
        r.slug = s.getSlug();
        r.name = s.getName();
        r.description = s.getDescription();
        r.logoUrl = s.getLogoUrl();
        r.contactEmail = s.getContactEmail();
        r.status = s.getStatus();
        r.rejectReason = s.getRejectReason();
        return r;
    }
}
