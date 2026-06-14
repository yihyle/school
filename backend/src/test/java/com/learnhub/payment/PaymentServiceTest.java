package com.learnhub.payment;

import com.learnhub.common.exception.DuplicateResourceException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.enrollment.EnrollmentService;
import com.learnhub.notification.NotificationService;
import com.learnhub.payment.dto.ConfirmPaymentRequest;
import com.learnhub.payment.dto.CreateOrderRequest;
import com.learnhub.payment.dto.PaymentResponse;
import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 결제 서비스 단위 테스트.
 * 멱등성(중복 승인 방지), 금액 위변조 검증, 결제 완료 시 수강 자동 등록을 검증한다.
 * (F-P3-08 / F-P3-09 / F-P3-10)
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PaymentServiceTest {

    @Mock PaymentRepository paymentRepository;
    @Mock CourseRepository courseRepository;
    @Mock UserRepository userRepository;
    @Mock EnrollmentRepository enrollmentRepository;
    @Mock EnrollmentService enrollmentService;
    @Mock NotificationService notificationService;
    @Mock TossPaymentClient tossPaymentClient;

    @InjectMocks PaymentService paymentService;

    private Payment readyPayment() {
        return Payment.builder()
                .id(100L)
                .orderId("order_abc")
                .userId(1L)
                .courseId(2L)
                .amount(10000)
                .status(PaymentStatus.READY)
                .build();
    }

    private Course course() {
        Course c = mock(Course.class);
        when(c.getId()).thenReturn(2L);
        when(c.getTitle()).thenReturn("스프링 부트 입문");
        when(c.getPrice()).thenReturn(10000);
        return c;
    }

    @Test
    @DisplayName("결제 승인 성공 → PAID 전이 + 수강 자동 등록 + 알림 적재")
    void confirm_success() {
        Payment payment = readyPayment();
        Course c = course();
        when(paymentRepository.findByOrderId("order_abc")).thenReturn(Optional.of(payment));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(c));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 2L)).thenReturn(false);

        ConfirmPaymentRequest req = new ConfirmPaymentRequest();
        req.setOrderId("order_abc");
        req.setAmount(10000);

        PaymentResponse res = paymentService.confirm(1L, req);

        assertThat(res.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(payment.getPaidAt()).isNotNull();
        verify(enrollmentService, times(1)).enroll(1L, 2L);
        // 결제완료 알림 + 운영자 알림 2건 적재
        verify(notificationService, times(2)).enqueue(any(), anyString(), anyString(), anyString(), anyString());
        verify(tossPaymentClient, never()).confirm(any(), any(), any()); // MOCK 모드
    }

    @Test
    @DisplayName("이미 PAID 된 주문 재승인 → 멱등 처리(재등록·재알림 없음)")
    void confirm_idempotent() {
        Payment payment = readyPayment();
        payment.setStatus(PaymentStatus.PAID);
        Course c = course();
        when(paymentRepository.findByOrderId("order_abc")).thenReturn(Optional.of(payment));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(c));

        ConfirmPaymentRequest req = new ConfirmPaymentRequest();
        req.setOrderId("order_abc");
        req.setAmount(10000);

        PaymentResponse res = paymentService.confirm(1L, req);

        assertThat(res.getStatus()).isEqualTo(PaymentStatus.PAID);
        verify(enrollmentService, never()).enroll(anyLong(), anyLong());
        verify(notificationService, never()).enqueue(any(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("결제 금액 위변조 → 400 + 주문 FAILED 처리")
    void confirm_amountMismatch() {
        Payment payment = readyPayment();
        Course c = course();
        when(paymentRepository.findByOrderId("order_abc")).thenReturn(Optional.of(payment));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(c));

        ConfirmPaymentRequest req = new ConfirmPaymentRequest();
        req.setOrderId("order_abc");
        req.setAmount(1); // 위변조된 금액

        assertThatThrownBy(() -> paymentService.confirm(1L, req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("금액");
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        verify(enrollmentService, never()).enroll(anyLong(), anyLong());
    }

    @Test
    @DisplayName("타인의 주문 결제 시도 → 403")
    void confirm_notOwner() {
        Payment payment = readyPayment(); // userId=1
        Course c = course();
        when(paymentRepository.findByOrderId("order_abc")).thenReturn(Optional.of(payment));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(c));

        ConfirmPaymentRequest req = new ConfirmPaymentRequest();
        req.setOrderId("order_abc");
        req.setAmount(10000);

        assertThatThrownBy(() -> paymentService.confirm(999L, req))
                .isInstanceOf(ResponseStatusException.class);
        verify(enrollmentService, never()).enroll(anyLong(), anyLong());
    }

    @Test
    @DisplayName("이미 수강 중인 강의는 주문 생성 불가")
    void createOrder_alreadyEnrolled() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        Course c = course();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(c));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 2L)).thenReturn(true);

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCourseId(2L);

        assertThatThrownBy(() -> paymentService.createOrder(1L, req))
                .isInstanceOf(DuplicateResourceException.class);
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("주문 생성 성공 → READY 상태, 강의 금액으로 적재")
    void createOrder_success() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        Course c = course();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(c));
        when(enrollmentRepository.existsByUserIdAndCourseId(1L, 2L)).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateOrderRequest req = new CreateOrderRequest();
        req.setCourseId(2L);

        PaymentResponse res = paymentService.createOrder(1L, req);

        assertThat(res.getStatus()).isEqualTo(PaymentStatus.READY);
        assertThat(res.getAmount()).isEqualTo(10000);
        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getOrderId()).startsWith("order_");
    }
}
