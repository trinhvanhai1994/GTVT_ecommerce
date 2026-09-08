package gtvt.haitv.ecommerce.order.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;

@FeignClient(name = "PRODUCT-SERVICE", url = "${clients.product.url:http://localhost:8082}")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ApiResponse<RemoteProduct> getProduct(@PathVariable("id") Long id);

    class RemoteProduct {
        private Long id;
        private String name;
        private BigDecimal price;
        private String status;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
