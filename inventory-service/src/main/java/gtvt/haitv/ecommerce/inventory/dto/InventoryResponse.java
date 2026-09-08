package gtvt.haitv.ecommerce.inventory.dto;

import gtvt.haitv.ecommerce.inventory.domain.Inventory;

public class InventoryResponse {
    private Long id;
    private Long productId;
    private int availableQuantity;
    private int reservedQuantity;
    public static InventoryResponse from(Inventory i) {
        InventoryResponse r = new InventoryResponse();
        r.id = i.getId();
        r.productId = i.getProductId();
        r.availableQuantity = i.getAvailableQuantity();
        r.reservedQuantity = i.getReservedQuantity();
        return r;
    }
    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public int getAvailableQuantity() { return availableQuantity; }
    public int getReservedQuantity() { return reservedQuantity; }
}
