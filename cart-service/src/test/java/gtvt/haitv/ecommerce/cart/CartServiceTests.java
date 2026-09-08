package gtvt.haitv.ecommerce.cart;

import gtvt.haitv.ecommerce.cart.client.ProductClient;
import gtvt.haitv.ecommerce.cart.dto.AddCartItemRequest;
import gtvt.haitv.ecommerce.cart.service.CartService;
import gtvt.haitv.ecommerce.common.api.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class CartServiceTests {

    @Autowired CartService cartService;
    @MockBean ProductClient productClient;

    @Test
    void addUpdateRemoveClear() {
        when(productClient.getProduct(anyLong())).thenReturn(ApiResponse.ok(Map.of("id", 1, "name", "P", "status", "ACTIVE")));
        AddCartItemRequest add = new AddCartItemRequest();
        add.setProductId(1L);
        add.setQuantity(2);
        var cart = cartService.addItem(9L, add);
        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getItems().getFirst().getQuantity());
        Long itemId = cart.getItems().getFirst().getId();
        cart = cartService.updateItem(9L, itemId, 5);
        assertEquals(5, cart.getItems().getFirst().getQuantity());
        cart = cartService.removeItem(9L, itemId);
        assertEquals(0, cart.getItems().size());
        add.setQuantity(1);
        cartService.addItem(9L, add);
        cart = cartService.clear(9L);
        assertEquals(0, cart.getItems().size());
    }
}
