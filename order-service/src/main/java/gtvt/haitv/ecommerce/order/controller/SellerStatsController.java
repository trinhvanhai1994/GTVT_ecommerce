package gtvt.haitv.ecommerce.order.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.order.dto.SellerStatsResponse;
import gtvt.haitv.ecommerce.order.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dedicated stats route (flat path) so it never collides with /seller/{id} or static resolution.
 * Also exposed as GET /api/orders/seller/stats via {@link SellerOrderController#sellerStats}.
 */
@RestController
@RequestMapping("/api/orders")
public class SellerStatsController {

    private final OrderService orderService;

    public SellerStatsController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/seller-stats")
    public ApiResponse<SellerStatsResponse> sellerStatsFlat(
            @RequestParam("shopId") Long shopId,
            @RequestParam(value = "days", defaultValue = "7") int days) {
        return ApiResponse.ok(orderService.sellerStats(shopId, days));
    }
}
