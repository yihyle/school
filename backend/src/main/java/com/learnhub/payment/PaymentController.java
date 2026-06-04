package com.learnhub.payment;

import com.learnhub.payment.dto.ConfirmPaymentRequest;
import com.learnhub.payment.dto.CreateOrderRequest;
import com.learnhub.payment.dto.PaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "강의 결제 API")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders")
    @Operation(summary = "결제 주문 생성 (READY)")
    public ResponseEntity<PaymentResponse> createOrder(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(userId, request));
    }

    @PostMapping("/confirm")
    @Operation(summary = "결제 승인 (PAID + 수강 자동 등록)")
    public ResponseEntity<PaymentResponse> confirm(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ConfirmPaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirm(userId, request));
    }
}
