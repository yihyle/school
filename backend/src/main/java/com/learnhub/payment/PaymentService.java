package com.learnhub.payment;

import com.learnhub.common.exception.DuplicateResourceException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.enrollment.EnrollmentService;
import com.learnhub.notification.NotificationService;
import com.learnhub.notification.NotificationType;
import com.learnhub.payment.dto.ConfirmPaymentRequest;
import com.learnhub.payment.dto.CreateOrderRequest;
import com.learnhub.payment.dto.PaymentResponse;
import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 강의 결제 서비스.
 *  - createOrder()  : 주문(READY) 생성
 *  - confirm()      : 결제 승인 → PAID, 수강 자동 등록, 결제/운영 알림 적재
 * provider=MOCK 이면 외부 PG 호출 없이 승인 처리(로컬/발표 환경), TOSS 이면 토스 승인 API 연동.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentService enrollmentService;
    private final NotificationService notificationService;
    private final TossPaymentClient tossPaymentClient;

    @Value("${payment.provider:MOCK}")
    private String provider;

    @Transactional
    public PaymentResponse createOrder(Long userId, CreateOrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", req.getCourseId()));

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId())) {
            throw new DuplicateResourceException("이미 수강 중인 강의입니다");
        }

        int amount = course.getPrice() != null ? course.getPrice() : 0;
        String orderId = "order_" + UUID.randomUUID().toString().replace("-", "");

        Payment payment = paymentRepository.save(Payment.builder()
                .orderId(orderId)
                .userId(user.getId())
                .courseId(course.getId())
                .amount(amount)
                .status(PaymentStatus.READY)
                .build());

        log.info("[Payment] 주문 생성 orderId={} userId={} courseId={} amount={}",
                orderId, userId, course.getId(), amount);
        return PaymentResponse.of(payment, course.getTitle());
    }

    @Transactional
    public PaymentResponse confirm(Long userId, ConfirmPaymentRequest req) {
        Payment payment = paymentRepository.findByOrderId(req.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("주문을 찾을 수 없습니다: " + req.getOrderId()));

        if (!payment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 주문만 결제할 수 있습니다");
        }

        Course course = courseRepository.findById(payment.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", payment.getCourseId()));

        // 멱등성: 이미 결제 완료된 주문은 그대로 반환
        if (PaymentStatus.PAID.equals(payment.getStatus())) {
            return PaymentResponse.of(payment, course.getTitle());
        }
        if (!PaymentStatus.READY.equals(payment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "결제할 수 없는 주문 상태입니다: " + payment.getStatus());
        }
        // 금액 위변조 검증
        if (!payment.getAmount().equals(req.getAmount())) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 금액이 주문 금액과 일치하지 않습니다");
        }

        // 외부 PG 승인 (TOSS) 또는 MOCK 통과
        String method = "MOCK";
        if ("TOSS".equalsIgnoreCase(provider)) {
            tossPaymentClient.confirm(req.getPaymentKey(), req.getOrderId(), req.getAmount());
            method = "CARD";
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentKey(req.getPaymentKey());
        payment.setMethod(method);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 결제 완료 → 수강 자동 등록 (중복 방지)
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId())) {
            enrollmentService.enroll(userId, course.getId());
        }

        // 알림 적재 (아웃박스 → 스케줄러가 디스코드로 발송)
        notificationService.enqueue(userId, NotificationType.PAYMENT_PAID, "💳 결제 완료",
                String.format("'%s' 강의 결제가 완료되었습니다. (금액 %,d원)", course.getTitle(), payment.getAmount()),
                "payment-paid:" + payment.getOrderId());
        notificationService.enqueue(null, NotificationType.OPS_ALERT, "🔔 신규 결제 발생",
                String.format("userId=%d 가 '%s'(%,d원) 결제를 완료했습니다.", userId, course.getTitle(), payment.getAmount()),
                "ops-payment:" + payment.getOrderId());

        log.info("[Payment] 결제 완료 orderId={} userId={} courseId={}", payment.getOrderId(), userId, course.getId());
        return PaymentResponse.of(payment, course.getTitle());
    }
}
