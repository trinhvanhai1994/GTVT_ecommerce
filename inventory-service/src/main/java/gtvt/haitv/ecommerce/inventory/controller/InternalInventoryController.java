package gtvt.haitv.ecommerce.inventory.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.inventory.dto.StockCheckResponse;
import gtvt.haitv.ecommerce.inventory.dto.StockItemsRequest;
import gtvt.haitv.ecommerce.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/inventory")
public class InternalInventoryController {

    private final InventoryService inventoryService;

    public InternalInventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/check")
    public ApiResponse<StockCheckResponse> check(@Valid @RequestBody StockItemsRequest request) {
        return ApiResponse.ok(inventoryService.check(request));
    }

    @PostMapping("/reserve")
    public ApiResponse<Void> reserve(@Valid @RequestBody StockItemsRequest request) {
        inventoryService.reserve(request);
        return ApiResponse.ok("Reserved", null);
    }

    @PostMapping("/release")
    public ApiResponse<Void> release(@Valid @RequestBody StockItemsRequest request) {
        inventoryService.release(request);
        return ApiResponse.ok("Released", null);
    }

    @PostMapping("/deduct")
    public ApiResponse<Void> deduct(@Valid @RequestBody StockItemsRequest request) {
        inventoryService.deduct(request);
        return ApiResponse.ok("Deducted", null);
    }
}
