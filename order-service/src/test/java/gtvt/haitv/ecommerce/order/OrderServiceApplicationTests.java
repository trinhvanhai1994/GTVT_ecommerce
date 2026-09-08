package gtvt.haitv.ecommerce.order;

import gtvt.haitv.ecommerce.order.client.CartClient;
import gtvt.haitv.ecommerce.order.client.InventoryClient;
import gtvt.haitv.ecommerce.order.client.PaymentClient;
import gtvt.haitv.ecommerce.order.client.ProductClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceApplicationTests {
    @MockBean CartClient cartClient;
    @MockBean ProductClient productClient;
    @MockBean InventoryClient inventoryClient;
    @MockBean PaymentClient paymentClient;

    @Test
    void contextLoads() {
    }
}
