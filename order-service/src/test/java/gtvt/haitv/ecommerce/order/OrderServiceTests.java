package gtvt.haitv.ecommerce.order;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.order.client.CartClient;
import gtvt.haitv.ecommerce.order.client.InventoryClient;
import gtvt.haitv.ecommerce.order.client.PaymentClient;
import gtvt.haitv.ecommerce.order.client.ProductClient;
import gtvt.haitv.ecommerce.order.dto.CheckoutRequest;
import gtvt.haitv.ecommerce.order.messaging.OrderEventPublisher;
import gtvt.haitv.ecommerce.order.repository.OrderRepository;
import gtvt.haitv.ecommerce.order.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceTests {

    @Autowired OrderService orderService;
    @Autowired OrderRepository orderRepository;
    @MockBean CartClient cartClient;
    @MockBean ProductClient productClient;
    @MockBean InventoryClient inventoryClient;
    @MockBean PaymentClient paymentClient;
    @MockBean OrderEventPublisher eventPublisher;

    @BeforeEach
    void reset() {
        orderRepository.deleteAll();
    }

    private CheckoutRequest checkout() {
        CheckoutRequest r = new CheckoutRequest();
        r.setShippingName("A");
        r.setShippingPhone("090");
        r.setShippingAddress("HN");
        r.setPaymentMethod("MOCK_CARD");
        return r;
    }

    private void stubCartAndProduct() {
        CartClient.RemoteItem item = new CartClient.RemoteItem();
        item.setId(1L);
        item.setProductId(1L);
        item.setQuantity(2);
        CartClient.RemoteCart cart = new CartClient.RemoteCart();
        cart.setItems(List.of(item));
        when(cartClient.getCart(5L)).thenReturn(ApiResponse.ok(cart));
        ProductClient.RemoteProduct p = new ProductClient.RemoteProduct();
        p.setId(1L);
        p.setName("Phone");
        p.setPrice(new BigDecimal("100.00"));
        p.setStatus("ACTIVE");
        when(productClient.getProduct(1L)).thenReturn(ApiResponse.ok(p));
    }

    @Test
    void createSuccess() {
        stubCartAndProduct();
        InventoryClient.CheckResponse check = new InventoryClient.CheckResponse();
        check.setAvailable(true);
        when(inventoryClient.check(any())).thenReturn(ApiResponse.ok(check));
        when(inventoryClient.reserve(any())).thenReturn(ApiResponse.ok(null));
        when(inventoryClient.deduct(any())).thenReturn(ApiResponse.ok(null));
        when(cartClient.clearCart(5L)).thenReturn(ApiResponse.ok(new CartClient.RemoteCart()));
        PaymentClient.RemotePayment pay = new PaymentClient.RemotePayment();
        pay.setId(9L);
        pay.setStatus("SUCCESS");
        when(paymentClient.charge(any())).thenReturn(ApiResponse.ok(pay));
        var order = orderService.checkout(5L, "customer@example.com", checkout());
        assertEquals("CONFIRMED", order.getStatus());
        assertEquals(0, new BigDecimal("200.00").compareTo(order.getTotalAmount()));
    }

    @Test
    void outOfStock() {
        stubCartAndProduct();
        InventoryClient.CheckResponse check = new InventoryClient.CheckResponse();
        check.setAvailable(false);
        when(inventoryClient.check(any())).thenReturn(ApiResponse.ok(check));
        assertThrows(ApiException.class, () -> orderService.checkout(5L, "customer@example.com", checkout()));
    }

    @Test
    void paymentFailedCompensates() {
        stubCartAndProduct();
        InventoryClient.CheckResponse check = new InventoryClient.CheckResponse();
        check.setAvailable(true);
        when(inventoryClient.check(any())).thenReturn(ApiResponse.ok(check));
        when(inventoryClient.reserve(any())).thenReturn(ApiResponse.ok(null));
        when(inventoryClient.release(any())).thenReturn(ApiResponse.ok(null));
        PaymentClient.RemotePayment pay = new PaymentClient.RemotePayment();
        pay.setId(9L);
        pay.setStatus("FAILED");
        when(paymentClient.charge(any())).thenReturn(ApiResponse.ok(pay));
        var order = orderService.checkout(5L, "customer@example.com", checkout());
        assertEquals("PAYMENT_FAILED", order.getStatus());
    }

    @Test
    void emptyCart() {
        CartClient.RemoteCart cart = new CartClient.RemoteCart();
        cart.setItems(List.of());
        when(cartClient.getCart(5L)).thenReturn(ApiResponse.ok(cart));
        assertThrows(ApiException.class, () -> orderService.checkout(5L, "customer@example.com", checkout()));
    }

    @Test
    void cancelConfirmed() {
        stubCartAndProduct();
        InventoryClient.CheckResponse check = new InventoryClient.CheckResponse();
        check.setAvailable(true);
        when(inventoryClient.check(any())).thenReturn(ApiResponse.ok(check));
        when(inventoryClient.reserve(any())).thenReturn(ApiResponse.ok(null));
        when(inventoryClient.deduct(any())).thenReturn(ApiResponse.ok(null));
        when(inventoryClient.release(any())).thenReturn(ApiResponse.ok(null));
        when(cartClient.clearCart(5L)).thenReturn(ApiResponse.ok(new CartClient.RemoteCart()));
        PaymentClient.RemotePayment pay = new PaymentClient.RemotePayment();
        pay.setId(9L);
        pay.setStatus("SUCCESS");
        when(paymentClient.charge(any())).thenReturn(ApiResponse.ok(pay));
        var created = orderService.checkout(5L, "customer@example.com", checkout());
        var cancelled = orderService.cancel(created.getId(), 5L);
        assertEquals("CANCELLED", cancelled.getStatus());
    }
}
