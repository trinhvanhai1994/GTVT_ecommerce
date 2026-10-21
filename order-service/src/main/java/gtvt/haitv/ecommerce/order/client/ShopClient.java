package gtvt.haitv.ecommerce.order.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "SHOP-SERVICE", url = "${clients.shop.url:http://localhost:8089}")
public interface ShopClient {

    @GetMapping("/api/shops/id/{id}")
    ApiResponse<RemoteShop> getById(@PathVariable("id") Long id);

    @GetMapping("/api/shops/internal/{shopId}/members/{userId}")
    ApiResponse<Map<String, Boolean>> member(@PathVariable("shopId") Long shopId, @PathVariable("userId") Long userId);

    class RemoteShop {
        private Long id;
        private String name;
        private String status;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
