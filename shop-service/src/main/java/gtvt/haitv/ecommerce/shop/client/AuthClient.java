package gtvt.haitv.ecommerce.shop.client;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "AUTH-SERVICE", url = "${clients.auth.url:http://localhost:8081}")
public interface AuthClient {

    @GetMapping("/internal/users/by-email")
    ApiResponse<RemoteUser> byEmail(@RequestParam("email") String email);

    @PostMapping("/internal/users/{id}/role")
    ApiResponse<Void> setRole(@PathVariable("id") Long id, @RequestBody Map<String, String> body);

    class RemoteUser {
        private Long id;
        private String email;
        private String role;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
