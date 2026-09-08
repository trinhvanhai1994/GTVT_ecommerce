package gtvt.haitv.ecommerce.cart.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.util.Map;

@FeignClient(name = "PRODUCT-SERVICE", url = "${clients.product.url:http://localhost:8082}")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ApiResponse<Map<String, Object>> getProduct(@PathVariable("id") Long id);
}
