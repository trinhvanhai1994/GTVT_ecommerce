package gtvt.haitv.ecommerce.order.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.order.dto.CheckoutRequest;
import gtvt.haitv.ecommerce.order.dto.OrderResponse;
import gtvt.haitv.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        var user = SecurityUtils.currentUser();
        return ApiResponse.ok("Created", orderService.checkout(user.getUserId(), user.getEmail(), request));
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> list() {
        return ApiResponse.ok(orderService.myOrders(SecurityUtils.currentUserId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> get(@PathVariable("id") Long id) {
        return ApiResponse.ok(orderService.get(id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<OrderResponse> cancel(@PathVariable("id") Long id) {
        return ApiResponse.ok(orderService.cancel(id, SecurityUtils.currentUserId()));
    }
}
