package gtvt.haitv.ecommerce.auth.controller;

import gtvt.haitv.ecommerce.auth.dto.UpdateUserStatusRequest;
import gtvt.haitv.ecommerce.auth.dto.UserResponse;
import gtvt.haitv.ecommerce.auth.service.AuthService;
import gtvt.haitv.ecommerce.common.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AuthService authService;

    public AdminUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> list() {
        return ApiResponse.ok(authService.listUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> get(@PathVariable("id") Long id) {
        return ApiResponse.ok(authService.getUserResponse(id));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<UserResponse> status(@PathVariable("id") Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        return ApiResponse.ok(authService.updateStatus(id, request.getStatus()));
    }
}
