# LearnHub P3 아키텍처

> 외부연동/배치/관측성 구조 — 아웃박스(Outbox) 패턴 중심

---

## 1. 알림 아웃박스(Outbox) 패턴

핵심 원칙: **사건 발생(트랜잭션)** 과 **외부 발송(네트워크)** 을 분리한다.
디스코드가 느리거나 죽어도 사용자 요청은 즉시 끝나고, 발송은 백그라운드 스케줄러가 책임진다.

```
[사건 발생]                         [백그라운드]                [외부]
회원가입 / 새 영상 / Q&A 답변 / 결제
        │ enqueue(dedupKey)
        ▼
  notification (PENDING) ──────▶ NotificationDispatchJob ──▶ DiscordWebhookClient ──▶ 디스코드
        ▲  (DB, 멱등키 유일제약)        (@Scheduled 30s)            성공: SENT
        │                                                          실패: retry_count++,
        └──────────── 재시도 대상(FAILED) ◀───────────────────────  maxRetry 초과 시 DEAD
```

- **enqueue**: `dedup_key` 유일 제약으로 중복 사건을 무시(멱등).
- **dispatch**: PENDING/FAILED 를 모아 발송. 성공 → SENT, 실패 → retry_count 증가 후 FAILED, 한도 초과 → DEAD.

### 알림 트리거 매핑

| 사건 | 발생 위치 | type | 대상 |
| --- | --- | --- | --- |
| 새 영상 등록 | `SectionService.addLecture` | NEW_LECTURE | 강의 구독자 |
| Q&A 답변(대댓글) | `CommentService.create` | QNA_ANSWERED | 질문 작성자 |
| 미학습 N일 | `InactiveLearnerReminderJob` | INACTIVE_REMINDER | 해당 수강생 |
| 신규 가입 | `UserService.signup` | OPS_ALERT | 운영 채널 |
| 결제 완료 | `PaymentService.confirm` | PAYMENT_PAID / OPS_ALERT | 구매자 / 운영 채널 |

---

## 2. 스케줄러 / 배치

| 잡 | 주기 | 멱등성 | 동작 |
| --- | --- | --- | --- |
| `NotificationDispatchJob` | 30초(fixedDelay) | 상태 전이로 자연 멱등 | PENDING/FAILED 알림 발송·재시도 |
| `InactiveLearnerReminderJob` | 매일 09:00(cron) | `job_log.job_key`(=잡명+날짜) 유일제약 | 미학습 수강건에 리마인드 알림 적재 |

- 단일 인스턴스 가정. 다중 인스턴스 확장 시 `ShedLock` 등 분산 락 필요(범위 밖).

---

## 3. 결제 흐름

```
[Client]                         [Backend]                         [PG/토스]
  POST /payments/orders ───────▶ createOrder: course.price 로 READY 주문 생성
        ◀───────────────────────  orderId, amount
  (결제 위젯에서 결제 진행)
  POST /payments/confirm ──────▶ confirm:
                                  1. 주문 소유권 검증
                                  2. 멱등(이미 PAID면 그대로 반환)
                                  3. 금액 위변조 검증
                                  4. provider=TOSS면 ───────────▶ 토스 승인 API
                                  5. PAID 처리
                                  6. 수강 자동 등록(중복 방지)
                                  7. 알림 적재(PAYMENT_PAID, OPS_ALERT)
        ◀───────────────────────  PaymentResponse(PAID)
```

- `provider=MOCK`(기본): 외부 호출 없이 승인 → 로컬/발표 환경에서 즉시 동작.
- `provider=TOSS`: `TossPaymentClient` 가 토스 승인 API 호출(Basic 인증).

---

## 4. 관측성

- **헬스체크**: `/actuator/health`, `/actuator/info` 무인증. 그 외 actuator 는 ADMIN.
- **메트릭**: `/actuator/metrics` (ADMIN).
- **구조화 로그**: `RequestLoggingFilter` 가 요청마다 `traceId` 를 MDC 에 주입 → 모든 로그에 상관관계 ID. 응답 헤더 `X-Trace-Id` 로도 반환.

---

## 5. 신규 컴포넌트 패키지

```
com.learnhub
├── notification   # Notification(Outbox), DiscordWebhookClient, NotificationService
├── subscription   # 강의 알림 구독
├── payment        # 결제(주문/승인), TossPaymentClient
├── batch          # JobLog + @Scheduled 잡 2종
├── config         # SchedulingConfig(@EnableScheduling)
└── common         # RequestLoggingFilter(traceId)
```

DB: `V6__add_p3_subscription_notification_payment_job.sql`
→ `subscription`, `notification`, `payment`, `job_log` 테이블 신규.
