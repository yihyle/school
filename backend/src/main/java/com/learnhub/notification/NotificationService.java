package com.learnhub.notification;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 알림 아웃박스 서비스.
 *  - enqueue()  : 사건 발생 시 PENDING 으로 적재 (dedupKey 로 멱등 보장)
 *  - dispatchPending() : 스케줄러가 호출, 대기/실패 건을 외부 채널로 발송 + 재시도
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final DiscordWebhookClient discordWebhookClient;

    @Value("${notification.max-retry:3}")
    private int maxRetry;

    /**
     * 알림을 아웃박스에 적재한다. 동일 dedupKey 가 이미 있으면 무시(중복 방지).
     * @return 새로 적재되면 true, 중복이면 false
     */
    @Transactional
    public boolean enqueue(Long userId, String type, String title, String message, String dedupKey) {
        if (notificationRepository.existsByDedupKey(dedupKey)) {
            return false;
        }
        try {
            notificationRepository.save(Notification.builder()
                    .userId(userId)
                    .type(type)
                    .channel("DISCORD")
                    .title(title)
                    .message(message)
                    .status(NotificationStatus.PENDING)
                    .retryCount(0)
                    .dedupKey(dedupKey)
                    .build());
            return true;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 동시성으로 unique(dedup_key) 충돌 → 멱등 처리
            return false;
        }
    }

    /**
     * 발송 대기/실패 알림을 외부 채널로 전송한다.
     * 실패 시 retryCount 증가, maxRetry 초과 시 DEAD 처리.
     * @return 이번 호출에서 발송 성공한 건수
     */
    @Transactional
    public int dispatchPending(int batchSize) {
        List<Notification> targets = notificationRepository.findByStatusInOrderByCreatedAtAsc(
                List.of(NotificationStatus.PENDING, NotificationStatus.FAILED),
                PageRequest.of(0, batchSize));

        int sent = 0;
        for (Notification n : targets) {
            try {
                discordWebhookClient.send(n.getTitle(), n.getMessage());
                n.setStatus(NotificationStatus.SENT);
                n.setSentAt(LocalDateTime.now());
                n.setLastError(null);
                sent++;
            } catch (Exception e) {
                int next = n.getRetryCount() + 1;
                n.setRetryCount(next);
                n.setLastError(safe(e.getMessage()));
                n.setStatus(next >= maxRetry ? NotificationStatus.DEAD : NotificationStatus.FAILED);
                log.warn("[Notification] 발송 실패 id={} retry={} status={} err={}",
                        n.getId(), next, n.getStatus(), e.getMessage());
            }
            notificationRepository.save(n);
        }
        if (sent > 0) {
            log.info("[Notification] {}건 발송 완료 (대상 {}건)", sent, targets.size());
        }
        return sent;
    }

    private String safe(String msg) {
        if (msg == null) return "unknown error";
        return msg.length() > 500 ? msg.substring(0, 500) : msg;
    }
}
