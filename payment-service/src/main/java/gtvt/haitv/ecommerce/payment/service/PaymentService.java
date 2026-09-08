package gtvt.haitv.ecommerce.payment.service;

import gtvt.haitv.ecommerce.common.exception.ApiException;
import gtvt.haitv.ecommerce.common.log.FlowLog;
import gtvt.haitv.ecommerce.common.security.SecurityUtils;
import gtvt.haitv.ecommerce.payment.domain.Payment;
import gtvt.haitv.ecommerce.payment.dto.CreatePaymentRequest;
import gtvt.haitv.ecommerce.payment.dto.PaymentResponse;
import gtvt.haitv.ecommerce.payment.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public PaymentResponse charge(CreatePaymentRequest request) {
        FlowLog f = FlowLog.start("charge");
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        if (request.isSimulateFailure()) {
            payment.setStatus("FAILED");
            payment.setFailureReason("Simulated payment failure");
            f.step("simulate FAIL");
        } else {
            payment.setStatus("SUCCESS");
            f.step("mock SUCCESS");
        }
        Payment saved = paymentRepository.save(payment);
        f.end("id=" + saved.getId() + " orderId=" + saved.getOrderId() + " " + saved.getStatus());
        return PaymentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PaymentResponse get(Long id) {
        FlowLog f = FlowLog.start("getPayment");
        try {
            Payment payment = paymentRepository.findById(id)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Payment not found"));
            SecurityUtils.requireOwnerOrAdmin(payment.getUserId());
            f.end("id=" + id + " " + payment.getStatus());
            return PaymentResponse.from(payment);
        } catch (RuntimeException e) {
            f.fail(e);
            throw e;
        }
    }
}
