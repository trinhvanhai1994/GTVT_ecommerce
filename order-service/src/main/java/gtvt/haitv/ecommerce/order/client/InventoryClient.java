package gtvt.haitv.ecommerce.order.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.ArrayList;
import java.util.List;

@FeignClient(name = "INVENTORY-SERVICE", url = "${clients.inventory.url:http://localhost:8084}")
public interface InventoryClient {

    @PostMapping("/internal/inventory/check")
    ApiResponse<CheckResponse> check(@RequestBody StockItemsRequest request);

    @PostMapping("/internal/inventory/reserve")
    ApiResponse<Void> reserve(@RequestBody StockItemsRequest request);

    @PostMapping("/internal/inventory/release")
    ApiResponse<Void> release(@RequestBody StockItemsRequest request);

    @PostMapping("/internal/inventory/deduct")
    ApiResponse<Void> deduct(@RequestBody StockItemsRequest request);

    class CheckResponse {
        private boolean available;
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }

    class StockItemsRequest {
        private List<Item> items = new ArrayList<>();
        public List<Item> getItems() { return items; }
        public void setItems(List<Item> items) { this.items = items; }
    }

    class Item {
        private Long productId;
        private Integer quantity;
        public Item() {}
        public Item(Long productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
