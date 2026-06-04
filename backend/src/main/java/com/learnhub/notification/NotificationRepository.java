package com.learnhub.notification;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    boolean existsByDedupKey(String dedupKey);

    Optional<Notification> findByDedupKey(String dedupKey);

    /** 발송 대기/실패 건을 오래된 순으로 가져온다(재시도 대상 포함). */
    List<Notification> findByStatusInOrderByCreatedAtAsc(List<String> statuses, Pageable pageable);

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
