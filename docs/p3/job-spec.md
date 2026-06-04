# LearnHub P3 배치 작업 명세 (Job Spec)

> 작업 정의 / 주기 / 실패 시 동작

---

## Job 1. NotificationDispatchJob (알림 디스패처)

| 항목 | 값 |
| --- | --- |
| 클래스 | `com.learnhub.batch.NotificationDispatchJob` |
| 주기 | `fixedDelay` 30초 (`notification.dispatch-interval-ms`) |
| 대상 | `notification` 중 status ∈ {PENDING, FAILED}, 오래된 순 최대 50건 |
| 동작 | 각 건을 디스코드로 발송 |
| 성공 | status=SENT, sent_at 기록 |
| 실패 | retry_count+1, last_error 기록. `retry_count >= notification.max-retry`(기본 3) 면 status=DEAD, 아니면 FAILED |
| 멱등성 | 상태 전이로 자연 보장(SENT 건은 재조회 안 됨) |
| 외부 의존 | 디스코드 Webhook. URL 미설정 시 발송 생략(로그만) → 로컬 안전 |

**실패 시나리오**

- 디스코드 4xx/5xx/타임아웃 → 예외 → FAILED 로 두고 다음 주기에 재시도.
- 최대 재시도 초과 → DEAD. 운영자가 원인 조치 후 수동으로 status 를 PENDING 으로 되돌려 재처리.

---

## Job 2. InactiveLearnerReminderJob (미학습 리마인드)

| 항목 | 값 |
| --- | --- |
| 클래스 | `com.learnhub.batch.InactiveLearnerReminderJob` |
| 주기 | cron `0 0 9 * * *` (매일 09:00, Asia/Seoul, `notification.inactive-cron`) |
| 기준 | 미완강 + `last_accessed_at < now - N일` (`notification.inactive-days`, 기본 7) |
| 동작 | 대상 수강건마다 INACTIVE_REMINDER 알림 적재(enqueue) |
| 알림 멱등키 | `inactive:{enrollmentId}:{날짜}` → 하루 1건 |
| 실행 멱등성 | `job_log.job_key = inactive-learner-reminder-{날짜}` 유일제약 → 같은 날 재실행 시 건너뜀 |
| 기록 | `job_log` 에 RUNNING→SUCCESS/FAILED, processed_count, message |

**실패 시나리오**

- 처리 중 예외 → job_log.status=FAILED + message 기록. 부분 적재분은 dedup_key 로 다음 정상 실행 시 자연 보충.

---

## 공통 정책

- **재시도**: 알림은 최대 N회(기본 3) 자동 재시도.
- **중복 방지(idempotency)**: 알림 `dedup_key`, 결제 `order_id`, 배치 `job_key` — 모두 DB 유일 제약.
- **작업 로그/상태**: 알림은 `notification.status`, 배치는 `job_log` 로 추적.
- **레이트리밋**: 한 주기당 배치 크기 제한(50건)으로 디스코드 레이트리밋 완화.
