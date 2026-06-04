package com.learnhub.batch;

import com.learnhub.enrollment.Enrollment;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.notification.NotificationService;
import com.learnhub.notification.NotificationType;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 장기 미학습 리마인드 배치.
 * 매일 09:00, 마지막 접속이 N일 이전인 미완강 수강건에 대해 INACTIVE_REMINDER 알림을 적재한다.
 * job_log(job_key) 로 하루 1회 실행을 보장하고, 알림 dedup_key 로 동일 사건 중복을 막는다.
 */
@Component
@RequiredArgsConstructor
public class InactiveLearnerReminderJob {

    private static final Logger log = LoggerFactory.getLogger(InactiveLearnerReminderJob.class);
    private static final String JOB_NAME = "inactive-learner-reminder";

    private final EnrollmentRepository enrollmentRepository;
    private final NotificationService notificationService;
    private final JobLogRepository jobLogRepository;

    @Value("${notification.inactive-days:7}")
    private int inactiveDays;

    /** 매일 09:00 (Asia/Seoul). */
    @Scheduled(cron = "${notification.inactive-cron:0 0 9 * * *}", zone = "Asia/Seoul")
    @Transactional
    public void run() {
        LocalDate today = LocalDate.now();
        String jobKey = JOB_NAME + "-" + today;

        // 멱등성: 오늘 이미 실행했으면 건너뜀
        if (jobLogRepository.existsByJobKey(jobKey)) {
            log.info("[{}] {} 이미 실행됨 → 건너뜀", JOB_NAME, jobKey);
            return;
        }

        JobLog jobLog = jobLogRepository.save(JobLog.builder()
                .jobName(JOB_NAME)
                .jobKey(jobKey)
                .status("RUNNING")
                .processedCount(0)
                .startedAt(LocalDateTime.now())
                .build());

        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(inactiveDays);
            List<Enrollment> targets =
                    enrollmentRepository.findByIsCompletedFalseAndLastAccessedAtBefore(cutoff);

            int enqueued = 0;
            for (Enrollment e : targets) {
                String dedupKey = "inactive:" + e.getId() + ":" + today;
                String title = "📚 학습 리마인드";
                String message = String.format(
                        "수강 중인 '%s' 강의를 %d일 넘게 이어보지 않았어요. 오늘 이어볼까요?",
                        e.getCourse() != null ? e.getCourse().getTitle() : "강의", inactiveDays);
                if (notificationService.enqueue(
                        e.getUser() != null ? e.getUser().getId() : null,
                        NotificationType.INACTIVE_REMINDER, title, message, dedupKey)) {
                    enqueued++;
                }
            }

            jobLog.setStatus("SUCCESS");
            jobLog.setProcessedCount(enqueued);
            jobLog.setMessage("대상 " + targets.size() + "건, 신규 적재 " + enqueued + "건");
            jobLog.setFinishedAt(LocalDateTime.now());
            jobLogRepository.save(jobLog);
            log.info("[{}] 완료 — 대상 {}건, 적재 {}건", JOB_NAME, targets.size(), enqueued);
        } catch (Exception ex) {
            jobLog.setStatus("FAILED");
            jobLog.setMessage(ex.getMessage() != null ? ex.getMessage() : "unknown error");
            jobLog.setFinishedAt(LocalDateTime.now());
            jobLogRepository.save(jobLog);
            log.error("[{}] 실패", JOB_NAME, ex);
        }
    }
}
