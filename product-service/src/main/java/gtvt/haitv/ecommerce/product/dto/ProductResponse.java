package gtvt.haitv.ecommerce.product.dto;

import gtvt.haitv.ecommerce.product.entity.Product;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private String brand;
    private String imageUrl;
    private String status;

    public static ProductResponse from(Product p) {
        ProductResponse r = new ProductResponse();
        r.id = p.getId();
        r.name = p.getName();
        r.description = p.getDescription();
        r.price = p.getPrice();
        r.categoryId = p.getCategoryId();
        r.brand = p.getBrand();
        r.imageUrl = p.getImageUrl();
        r.status = p.getStatus();
        return r;
    }
}
