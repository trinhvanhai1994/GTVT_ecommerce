package gtvt.haitv.ecommerce.payment.controller;

import gtvt.haitv.ecommerce.common.api.ApiResponse;
import gtvt.haitv.ecommerce.payment.dto.CreatePaymentRequest;
import gtvt.haitv.ecommerce.payment.dto.PaymentResponse;
import gtvt.haitv.ecommerce.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/internal/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponse> internalCharge(@Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.ok("Created", paymentService.charge(request));
    }

    @PostMapping("/api/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponse> charge(@Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.ok("Created", paymentService.charge(request));
    }

    @GetMapping("/api/payments/{id}")
    public ApiResponse<PaymentResponse> get(@PathVariable("id") Long id) {
        return ApiResponse.ok(paymentService.get(id));
    }
}
