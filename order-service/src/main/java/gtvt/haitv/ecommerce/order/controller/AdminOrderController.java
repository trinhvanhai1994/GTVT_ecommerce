package gtvt.haitv.ecommerce.order.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.order.dto.OrderResponse;
import gtvt.haitv.ecommerce.order.dto.UpdateOrderStatusRequest;
import gtvt.haitv.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> list() {
        return ApiResponse.ok(orderService.adminList());
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<OrderResponse> status(@PathVariable("id") Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.ok(orderService.adminStatus(id, request.getStatus()));
    }
}
