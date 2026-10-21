package gtvt.haitv.ecommerce.inventory.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "SHOP-SERVICE", url = "${clients.shop.url:http://localhost:8089}")
public interface ShopClient {

    @GetMapping("/api/shops/internal/{shopId}/members/{userId}")
    ApiResponse<Map<String, Boolean>> member(@PathVariable("shopId") Long shopId, @PathVariable("userId") Long userId);
}
