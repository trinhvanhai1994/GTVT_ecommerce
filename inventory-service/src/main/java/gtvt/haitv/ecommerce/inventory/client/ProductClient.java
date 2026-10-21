package gtvt.haitv.ecommerce.inventory.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PRODUCT-SERVICE", url = "${clients.product.url:http://localhost:8082}")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ApiResponse<RemoteProduct> get(@PathVariable("id") Long id);

    class RemoteProduct {
        private Long id;
        private Long shopId;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getShopId() { return shopId; }
        public void setShopId(Long shopId) { this.shopId = shopId; }
    }
}
