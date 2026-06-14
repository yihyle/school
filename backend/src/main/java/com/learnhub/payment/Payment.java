package com.learnhub.payment;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** 강의 결제. order_id 유일 제약으로 멱등성(중복 승인 방지)을 보장한다. */
@Entity
@Table(name = "payment", uniqueConstraints = @UniqueConstraint(name = "uk_payment_order_id", columnNames = "order_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, length = 64)
    private String orderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = PaymentStatus.READY;

    @Column(name = "payment_key", length = 200)
    private String paymentKey;

    @Column(length = 40)
    private String method;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
