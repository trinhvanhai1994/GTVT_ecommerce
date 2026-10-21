package gtvt.haitv.ecommerce.order.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.order.dto.OrderResponse;
import gtvt.haitv.ecommerce.order.dto.SellerStatsResponse;
import gtvt.haitv.ecommerce.order.dto.UpdateOrderStatusRequest;
import gtvt.haitv.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Seller-facing order APIs under /api/orders/seller (stats path must not collide with /{id}). */
@RestController
@RequestMapping("/api/orders/seller")
public class SellerOrderController {

    private final OrderService orderService;

    public SellerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> sellerOrders(@RequestParam("shopId") Long shopId) {
        return ApiResponse.ok(orderService.sellerOrders(shopId));
    }

    @GetMapping("/stats")
    public ApiResponse<SellerStatsResponse> sellerStats(
            @RequestParam("shopId") Long shopId,
            @RequestParam(value = "days", defaultValue = "7") int days) {
        return ApiResponse.ok(orderService.sellerStats(shopId, days));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> sellerGet(@PathVariable("id") Long id, @RequestParam("shopId") Long shopId) {
        return ApiResponse.ok(orderService.sellerGet(id, shopId));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<OrderResponse> sellerStatus(
            @PathVariable("id") Long id,
            @RequestParam("shopId") Long shopId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.ok(orderService.sellerStatus(id, shopId, request.getStatus()));
    }
}
