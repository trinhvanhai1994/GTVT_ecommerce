package gtvt.haitv.ecommerce.cart.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> items = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private int quantity;
    }
}
