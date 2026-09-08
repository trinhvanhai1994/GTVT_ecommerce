package gtvt.haitv.ecommerce.payment;

import gtvt.haitv.ecommerce.payment.dto.CreatePaymentRequest;
import gtvt.haitv.ecommerce.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class PaymentServiceTests {

    @Autowired PaymentService paymentService;

    @Test
    void successAndFailed() {
        CreatePaymentRequest ok = new CreatePaymentRequest();
        ok.setOrderId(1L);
        ok.setUserId(2L);
        ok.setAmount(new BigDecimal("10.00"));
        ok.setMethod("MOCK_CARD");
        ok.setSimulateFailure(false);
        assertEquals("SUCCESS", paymentService.charge(ok).getStatus());

        CreatePaymentRequest fail = new CreatePaymentRequest();
        fail.setOrderId(2L);
        fail.setUserId(2L);
        fail.setAmount(new BigDecimal("10.00"));
        fail.setMethod("MOCK_CARD");
        fail.setSimulateFailure(true);
        assertEquals("FAILED", paymentService.charge(fail).getStatus());
    }
}
