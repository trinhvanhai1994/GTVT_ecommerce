package gtvt.haitv.ecommerce.auth.controller;

import gtvt.haitv.ecommerce.auth.dto.UserResponse;
import gtvt.haitv.ecommerce.auth.service.AuthService;
import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final AuthService authService;

    public InternalUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/by-email")
    public ApiResponse<UserResponse> byEmail(@RequestParam("email") String email) {
        return ApiResponse.ok(authService.getUserResponseByEmail(email));
    }

    @PostMapping("/{id}/role")
    public ApiResponse<Void> setRole(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        authService.setRole(id, body.get("role"));
        return ApiResponse.ok(null);
    }
}
