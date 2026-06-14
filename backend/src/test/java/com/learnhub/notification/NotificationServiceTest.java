package com.learnhub.notification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 알림 아웃박스 서비스 단위 테스트.
 * 멱등성(dedupKey 중복 방지), 발송 성공/실패 재시도, 최대 횟수 초과 시 DEAD 전이를 검증한다.
 * (F-P3-06 / F-P3-07)
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock NotificationRepository notificationRepository;
    @Mock DiscordWebhookClient discordWebhookClient;

    @InjectMocks NotificationService notificationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(notificationService, "maxRetry", 3);
    }

    @Test
    @DisplayName("동일 dedupKey 가 이미 있으면 적재하지 않고 false")
    void enqueue_duplicate() {
        when(notificationRepository.existsByDedupKey("k1")).thenReturn(true);

        boolean result = notificationService.enqueue(1L, NotificationType.PAYMENT_PAID, "t", "m", "k1");

        assertThat(result).isFalse();
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("새 사건은 PENDING 으로 적재하고 true")
    void enqueue_new() {
        when(notificationRepository.existsByDedupKey("k2")).thenReturn(false);

        boolean result = notificationService.enqueue(1L, NotificationType.NEW_LECTURE, "t", "m", "k2");

        assertThat(result).isTrue();
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(NotificationStatus.PENDING);
        assertThat(saved.getChannel()).isEqualTo("DISCORD");
        assertThat(saved.getRetryCount()).isZero();
    }

    @Test
    @DisplayName("동시성으로 unique 충돌 시 멱등하게 false")
    void enqueue_uniqueViolation() {
        when(notificationRepository.existsByDedupKey("k3")).thenReturn(false);
        when(notificationRepository.save(any())).thenThrow(new DataIntegrityViolationException("dup"));

        boolean result = notificationService.enqueue(1L, NotificationType.OPS_ALERT, "t", "m", "k3");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("발송 성공 → SENT 전이 + sentAt 기록")
    void dispatch_success() {
        Notification n = pending(0);
        when(notificationRepository.findByStatusInOrderByCreatedAtAsc(anyList(), any(Pageable.class)))
                .thenReturn(List.of(n));

        int sent = notificationService.dispatchPending(50);

        assertThat(sent).isEqualTo(1);
        assertThat(n.getStatus()).isEqualTo(NotificationStatus.SENT);
        assertThat(n.getSentAt()).isNotNull();
    }

    @Test
    @DisplayName("발송 실패 + 재시도 여유 → FAILED 전이, retryCount 증가")
    void dispatch_failRetry() {
        Notification n = pending(0);
        when(notificationRepository.findByStatusInOrderByCreatedAtAsc(anyList(), any(Pageable.class)))
                .thenReturn(List.of(n));
        doThrow(new RuntimeException("429 rate limited")).when(discordWebhookClient).send(any(), any());

        int sent = notificationService.dispatchPending(50);

        assertThat(sent).isZero();
        assertThat(n.getStatus()).isEqualTo(NotificationStatus.FAILED);
        assertThat(n.getRetryCount()).isEqualTo(1);
        assertThat(n.getLastError()).contains("429");
    }

    @Test
    @DisplayName("최대 재시도 초과 → DEAD 전이")
    void dispatch_deadLetter() {
        Notification n = pending(2); // 다음 시도면 3 == maxRetry
        when(notificationRepository.findByStatusInOrderByCreatedAtAsc(anyList(), any(Pageable.class)))
                .thenReturn(List.of(n));
        doThrow(new RuntimeException("500 server error")).when(discordWebhookClient).send(any(), any());

        notificationService.dispatchPending(50);

        assertThat(n.getStatus()).isEqualTo(NotificationStatus.DEAD);
        assertThat(n.getRetryCount()).isEqualTo(3);
    }

    private Notification pending(int retryCount) {
        return Notification.builder()
                .id(1L)
                .userId(1L)
                .type(NotificationType.NEW_LECTURE)
                .channel("DISCORD")
                .title("새 영상")
                .message("새 영상이 등록되었습니다")
                .status(NotificationStatus.PENDING)
                .retryCount(retryCount)
                .dedupKey("dk")
                .build();
    }
}
