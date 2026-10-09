package gtvt.haitv.ecommerce.cart.service;

import feign.FeignException;
import gtvt.haitv.ecommerce.cart.client.ProductClient;
import gtvt.haitv.ecommerce.cart.entity.Cart;
import gtvt.haitv.ecommerce.cart.entity.CartItem;
import gtvt.haitv.ecommerce.cart.dto.AddCartItemRequest;
import gtvt.haitv.ecommerce.cart.dto.CartResponse;
import gtvt.haitv.ecommerce.cart.repository.CartRepository;
import gtvt.haitv.ecommerce.common.constant.ErrorConstant;
import gtvt.haitv.ecommerce.common.constant.MessageConstant;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductClient productClient;

    public CartService(CartRepository cartRepository, ProductClient productClient) {
        this.cartRepository = cartRepository;
        this.productClient = productClient;
    }

    private Cart persist(Cart cart) {
        return cartRepository.saveAndFlush(cart);
    }

    @Transactional
    public CartResponse getCart(Long userId) {
        FlowLog f = FlowLog.start("getCart");
        CartResponse r = toResponse(getOrCreate(userId));
        f.end("items=" + r.getItems().size());
        return r;
    }

    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        FlowLog f = FlowLog.start("addItem");
        try {
            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, MessageConstant.QUANTITY_MUST_BE_POSITIVE);
            }
            f.step("product " + request.getProductId());
            ensureProductExists(request.getProductId());
            Cart cart = getOrCreate(userId);
            CartItem existing = cart.getItems().stream()
                    .filter(i -> i.getProductId().equals(request.getProductId()))
                    .findFirst()
                    .orElse(null);
            if (existing == null) {
                CartItem item = new CartItem();
                item.setCart(cart);
                item.setProductId(request.getProductId());
                item.setQuantity(request.getQuantity());
                cart.getItems().add(item);
                f.step("insert qty=" + request.getQuantity());
            } else {
                existing.setQuantity(existing.getQuantity() + request.getQuantity());
                f.step("inc qty=" + existing.getQuantity());
            }
            CartResponse r = toResponse(persist(cart));
            f.end("items=" + r.getItems().size());
            return r;
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long itemId, int quantity) {
        FlowLog f = FlowLog.start("updateItem");
        try {
            if (quantity <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorConstant.VALIDATION_ERROR, MessageConstant.QUANTITY_MUST_BE_POSITIVE);
            }
            Cart cart = getOrCreate(userId);
            CartItem item = itemOf(cart, itemId);
            item.setQuantity(quantity);
            f.end("itemId=" + itemId + " qty=" + quantity);
            return toResponse(persist(cart));
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        FlowLog f = FlowLog.start("removeItem");
        try {
            Cart cart = getOrCreate(userId);
            CartItem item = itemOf(cart, itemId);
            cart.getItems().remove(item);
            f.end("itemId=" + itemId);
            return toResponse(persist(cart));
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }

    @Transactional
    public CartResponse clear(Long userId) {
        FlowLog f = FlowLog.start("clearCart");
        Cart cart = getOrCreate(userId);
        cart.getItems().clear();
        f.endOk();
        return toResponse(persist(cart));
    }

    private void ensureProductExists(Long productId) {
        try {
            var response = productClient.getProduct(productId);
            if (response == null || response.getData() == null) {
                throw new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.PRODUCT_NOT_FOUND, MessageConstant.PRODUCT_NOT_FOUND);
            }
        } catch (FeignException.NotFound ex) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.PRODUCT_NOT_FOUND, MessageConstant.PRODUCT_NOT_FOUND);
        } catch (FeignException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorConstant.PRODUCT_SERVICE_ERROR, MessageConstant.PRODUCT_SERVICE_ERROR);
        }
    }

    private Cart getOrCreate(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserId(userId);
            return cartRepository.save(cart);
        });
    }

    private CartItem itemOf(Cart cart, Long itemId) {
        return cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorConstant.CART_ITEM_NOT_FOUND, MessageConstant.CART_ITEM_NOT_FOUND));
    }

    private CartResponse toResponse(Cart cart) {
        CartResponse r = new CartResponse();
        r.setId(cart.getId());
        r.setUserId(cart.getUserId());
        r.setItems(cart.getItems().stream().map(i -> {
            CartResponse.CartItemResponse ir = new CartResponse.CartItemResponse();
            ir.setId(i.getId());
            ir.setProductId(i.getProductId());
            ir.setQuantity(i.getQuantity());
            return ir;
        }).toList());
        return r;
    }
}
