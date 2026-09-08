package gtvt.haitv.ecommerce.cart.controller;

import gtvt.haitv.ecommerce.cart.dto.CartResponse;
import gtvt.haitv.ecommerce.cart.service.CartService;
import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/cart")
public class InternalCartController {

    private final CartService cartService;

    public InternalCartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ApiResponse<CartResponse> get(@PathVariable("userId") Long userId) {
        return ApiResponse.ok(cartService.getCart(userId));
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<CartResponse> clear(@PathVariable("userId") Long userId) {
        return ApiResponse.ok(cartService.clear(userId));
    }
}
