package gtvt.haitv.ecommerce.cart.controller;

import gtvt.haitv.ecommerce.cart.dto.AddCartItemRequest;
import gtvt.haitv.ecommerce.cart.dto.CartResponse;
import gtvt.haitv.ecommerce.cart.dto.UpdateCartItemRequest;
import gtvt.haitv.ecommerce.cart.service.CartService;
import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ApiResponse<CartResponse> get() {
        return ApiResponse.ok(cartService.getCart(SecurityUtils.currentUserId()));
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CartResponse> add(@Valid @RequestBody AddCartItemRequest request) {
        return ApiResponse.ok("Added", cartService.addItem(SecurityUtils.currentUserId(), request));
    }

    @PutMapping("/items/{id}")
    public ApiResponse<CartResponse> update(@PathVariable("id") Long id, @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.ok(cartService.updateItem(SecurityUtils.currentUserId(), id, request.getQuantity()));
    }

    @DeleteMapping("/items/{id}")
    public ApiResponse<CartResponse> remove(@PathVariable("id") Long id) {
        return ApiResponse.ok(cartService.removeItem(SecurityUtils.currentUserId(), id));
    }

    @DeleteMapping
    public ApiResponse<CartResponse> clear() {
        return ApiResponse.ok(cartService.clear(SecurityUtils.currentUserId()));
    }
}
