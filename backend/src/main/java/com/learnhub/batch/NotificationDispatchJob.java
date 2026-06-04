package com.learnhub.batch;

import com.learnhub.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 알림 아웃박스 디스패처.
 * 30초마다 PENDING/FAILED 알림을 외부 채널(디스코드)로 발송한다.
 * (애플리케이션 요청 흐름과 분리된 백그라운드 처리 → 사용자 응답 지연 방지)
 */
@Component
@RequiredArgsConstructor
public class NotificationDispatchJob {

    private static final int BATCH_SIZE = 50;

    private final NotificationService notificationService;

    @Scheduled(fixedDelayString = "${notification.dispatch-interval-ms:30000}")
    public void dispatch() {
        notificationService.dispatchPending(BATCH_SIZE);
    }
}
