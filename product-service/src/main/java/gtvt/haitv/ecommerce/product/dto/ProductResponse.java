package gtvt.haitv.ecommerce.product.dto;

import gtvt.haitv.ecommerce.product.domain.Product;

import java.math.BigDecimal;

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
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public Long getCategoryId() { return categoryId; }
    public String getBrand() { return brand; }
    public String getImageUrl() { return imageUrl; }
    public String getStatus() { return status; }
}
