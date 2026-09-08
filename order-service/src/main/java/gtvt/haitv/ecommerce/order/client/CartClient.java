package gtvt.haitv.ecommerce.order.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "CART-SERVICE", url = "${clients.cart.url:http://localhost:8083}")
public interface CartClient {

    @GetMapping("/internal/cart/{userId}")
    ApiResponse<RemoteCart> getCart(@PathVariable("userId") Long userId);

    @DeleteMapping("/internal/cart/{userId}")
    ApiResponse<RemoteCart> clearCart(@PathVariable("userId") Long userId);

    class RemoteCart {
        private Long id;
        private Long userId;
        private List<RemoteItem> items;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public List<RemoteItem> getItems() { return items; }
        public void setItems(List<RemoteItem> items) { this.items = items; }
    }

    class RemoteItem {
        private Long id;
        private Long productId;
        private int quantity;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
