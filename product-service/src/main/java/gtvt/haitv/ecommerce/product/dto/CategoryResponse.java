package gtvt.haitv.ecommerce.product.dto;

import gtvt.haitv.ecommerce.product.domain.Category;

public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    public static CategoryResponse from(Category c) {
        CategoryResponse r = new CategoryResponse();
        r.id = c.getId();
        r.name = c.getName();
        r.description = c.getDescription();
        return r;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
}
