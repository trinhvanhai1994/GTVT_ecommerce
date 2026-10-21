package gtvt.haitv.ecommerce.shop.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.shop.dto.ShopRequest;
import gtvt.haitv.ecommerce.shop.dto.ShopResponse;
import gtvt.haitv.ecommerce.shop.service.ShopService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping
    public ApiResponse<List<ShopResponse>> list(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "q", required = false) String q) {
        return ApiResponse.ok(shopService.listPublic(status, q));
    }

    @GetMapping("/me")
    public ApiResponse<ShopResponse> me() {
        return ApiResponse.ok(shopService.myShop(SecurityUtils.currentUserId()));
    }

    @PutMapping("/me")
    public ApiResponse<ShopResponse> updateMe(@Valid @RequestBody ShopRequest request) {
        return ApiResponse.ok(shopService.updateMyShop(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ShopResponse> bySlug(@PathVariable("slug") String slug) {
        return ApiResponse.ok(shopService.getBySlug(slug));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ShopResponse> register(@Valid @RequestBody ShopRequest request) {
        return ApiResponse.ok("Registered", shopService.register(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/id/{id}")
    public ApiResponse<ShopResponse> byId(@PathVariable("id") Long id) {
        return ApiResponse.ok(shopService.getById(id));
    }

    @GetMapping("/internal/{id}/approved")
    public ApiResponse<Map<String, Boolean>> approved(@PathVariable("id") Long id) {
        return ApiResponse.ok(Map.of("approved", shopService.isApproved(id)));
    }

    @GetMapping("/internal/{shopId}/members/{userId}")
    public ApiResponse<Map<String, Boolean>> member(
            @PathVariable("shopId") Long shopId, @PathVariable("userId") Long userId) {
        return ApiResponse.ok(Map.of("member", shopService.isMember(shopId, userId)));
    }
}
