package gtvt.haitv.ecommerce.cart;

import gtvt.haitv.ecommerce.cart.client.ProductClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class CartServiceApplicationTests {
    @MockBean
    ProductClient productClient;

    @Test
    void contextLoads() {
    }
}
