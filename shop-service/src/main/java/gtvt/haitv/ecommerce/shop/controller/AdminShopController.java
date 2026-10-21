package gtvt.haitv.ecommerce.shop.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.shop.dto.RejectShopRequest;
import gtvt.haitv.ecommerce.shop.dto.ShopResponse;
import gtvt.haitv.ecommerce.shop.service.ShopService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shops")
public class AdminShopController {

    private final ShopService shopService;

    public AdminShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping
    public ApiResponse<List<ShopResponse>> listAll() {
        return ApiResponse.ok(shopService.listAllForAdmin());
    }

    @PatchMapping("/{id}/approve")
    public ApiResponse<ShopResponse> approve(@PathVariable("id") Long id) {
        return ApiResponse.ok(shopService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<ShopResponse> reject(@PathVariable("id") Long id, @Valid @RequestBody RejectShopRequest request) {
        return ApiResponse.ok(shopService.reject(id, request));
    }

    @PatchMapping("/{id}/suspend")
    public ApiResponse<ShopResponse> suspend(@PathVariable("id") Long id) {
        return ApiResponse.ok(shopService.suspend(id));
    }
}
