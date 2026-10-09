package gtvt.haitv.ecommerce.inventory.dto;

import gtvt.haitv.ecommerce.inventory.entity.Inventory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
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
}
