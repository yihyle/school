package com.learnhub.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** 결제 승인 요청. paymentKey 는 MOCK 모드에서는 생략 가능. */
@Getter
@Setter
public class ConfirmPaymentRequest {

    @NotNull(message = "orderId는 필수입니다")
    private String orderId;

    private String paymentKey;

    @NotNull(message = "amount는 필수입니다")
    private Integer amount;
}
