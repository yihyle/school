package com.learnhub.p3;

import com.learnhub.batch.JobLog;
import com.learnhub.batch.JobLogRepository;
import com.learnhub.notification.Notification;
import com.learnhub.notification.NotificationRepository;
import com.learnhub.notification.NotificationStatus;
import com.learnhub.notification.NotificationType;
import com.learnhub.payment.Payment;
import com.learnhub.payment.PaymentRepository;
import com.learnhub.payment.PaymentStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * P3 영속성 통합 테스트(@DataJpaTest, H2).
 * 실제 DB 레이어에서 멱등성 unique 제약과 아웃박스 조회 쿼리가 동작하는지 검증한다.
 * (F-P3-07 알림 멱등 / F-P3-10 결제 멱등 / 배치 job_key 멱등)
 */
@DataJpaTest
@ActiveProfiles("test")
class P3RepositoryIntegrationTest {

    @Autowired NotificationRepository notificationRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired JobLogRepository jobLogRepository;

    @Test
    @DisplayName("알림 dedup_key 는 유일 제약으로 중복 적재를 막는다")
    void notificationDedupKeyUnique() {
        notificationRepository.saveAndFlush(notification("dup-key"));

        assertThat(notificationRepository.existsByDedupKey("dup-key")).isTrue();
        assertThatThrownBy(() -> notificationRepository.saveAndFlush(notification("dup-key")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("PENDING/FAILED 알림을 오래된 순으로 조회한다(디스패치 대상)")
    void findPendingForDispatch() {
        notificationRepository.saveAndFlush(notification("k-pending"));
        Notification sent = notification("k-sent");
        sent.setStatus(NotificationStatus.SENT);
        notificationRepository.saveAndFlush(sent);

        List<Notification> targets = notificationRepository.findByStatusInOrderByCreatedAtAsc(
                List.of(NotificationStatus.PENDING, NotificationStatus.FAILED), PageRequest.of(0, 50));

        assertThat(targets).extracting(Notification::getDedupKey).containsExactly("k-pending");
    }

    @Test
    @DisplayName("결제 order_id 는 유일 제약으로 중복 주문을 막는다")
    void paymentOrderIdUnique() {
        paymentRepository.saveAndFlush(payment("order_x"));

        assertThatThrownBy(() -> paymentRepository.saveAndFlush(payment("order_x")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("배치 job_key 는 유일 제약으로 하루 1회 실행을 보장한다")
    void jobKeyUnique() {
        jobLogRepository.saveAndFlush(jobLog("inactive-learner-reminder-2026-06-15"));

        assertThat(jobLogRepository.existsByJobKey("inactive-learner-reminder-2026-06-15")).isTrue();
        assertThatThrownBy(() -> jobLogRepository.saveAndFlush(jobLog("inactive-learner-reminder-2026-06-15")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Notification notification(String dedupKey) {
        return Notification.builder()
                .userId(1L)
                .type(NotificationType.NEW_LECTURE)
                .channel("DISCORD")
                .title("새 영상")
                .message("새 영상이 등록되었습니다")
                .status(NotificationStatus.PENDING)
                .retryCount(0)
                .dedupKey(dedupKey)
                .build();
    }

    private Payment payment(String orderId) {
        return Payment.builder()
                .orderId(orderId)
                .userId(1L)
                .courseId(2L)
                .amount(10000)
                .status(PaymentStatus.READY)
                .build();
    }

    private JobLog jobLog(String jobKey) {
        return JobLog.builder()
                .jobName("inactive-learner-reminder")
                .jobKey(jobKey)
                .status("SUCCESS")
                .processedCount(0)
                .startedAt(LocalDateTime.now())
                .build();
    }
}
