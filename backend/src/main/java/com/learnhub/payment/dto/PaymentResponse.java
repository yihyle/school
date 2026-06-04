package com.learnhub.payment.dto;

import com.learnhub.payment.Payment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {
    private String orderId;
    private Long courseId;
    private String courseTitle;
    private Integer amount;
    private String status;
    private String method;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public static PaymentResponse of(Payment p, String courseTitle) {
        return PaymentResponse.builder()
                .orderId(p.getOrderId())
                .courseId(p.getCourseId())
                .courseTitle(courseTitle)
                .amount(p.getAmount())
                .status(p.getStatus())
                .method(p.getMethod())
                .createdAt(p.getCreatedAt())
                .paidAt(p.getPaidAt())
                .build();
    }
}
