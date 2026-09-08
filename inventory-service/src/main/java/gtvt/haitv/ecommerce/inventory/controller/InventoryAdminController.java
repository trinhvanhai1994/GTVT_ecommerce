package gtvt.haitv.ecommerce.inventory.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.inventory.dto.InventoryResponse;
import gtvt.haitv.ecommerce.inventory.dto.UpdateStockRequest;
import gtvt.haitv.ecommerce.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryAdminController {

    private final InventoryService inventoryService;

    public InventoryAdminController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ApiResponse<List<InventoryResponse>> list() {
        return ApiResponse.ok(inventoryService.list());
    }

    @GetMapping("/{productId}")
    public ApiResponse<InventoryResponse> get(@PathVariable("productId") Long productId) {
        return ApiResponse.ok(inventoryService.getByProduct(productId));
    }

    @PutMapping("/{productId}")
    public ApiResponse<InventoryResponse> update(@PathVariable("productId") Long productId, @Valid @RequestBody UpdateStockRequest request) {
        return ApiResponse.ok(inventoryService.updateAvailable(productId, request.getAvailableQuantity()));
    }
}
