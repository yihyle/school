# LearnHub P3 운영 Runbook

> 배포 / 환경변수 / 장애 대응 가이드

---

## 1. 환경변수

| 변수 | 용도 | 예시 |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | DB 접속 | jdbc:mysql://... |
| `JWT_SECRET` | JWT 서명 키(256bit+) | (운영용 무작위) |
| `CORS_ALLOWED_ORIGINS` | 허용 오리진 | https://learnhub.example.com |
| `DISCORD_WEBHOOK_URL` | 알림 채널 | https://discord.com/api/webhooks/... |
| `NOTIFICATION_MAX_RETRY` | 알림 최대 재시도 | 3 |
| `PAYMENT_PROVIDER` | 결제 모드 | MOCK / TOSS |
| `TOSS_SECRET_KEY` | 토스 시크릿 키 | test_sk_... |

> `DISCORD_WEBHOOK_URL` 미설정 시 알림은 발송되지 않고 로그만 남는다(로컬 안전 동작).

---

## 2. 배포

```bash
# 1) 환경변수 파일 준비
cp .env.prod.example .env.prod && vi .env.prod

# 2) 빌드 & 기동
docker compose -f docker-compose.prod.yml up -d --build

# 3) 헬스체크
curl -s http://localhost:8080/actuator/health    # {"status":"UP"}
```

CI/CD: `main` 푸시 시 `.github/workflows/ci.yml`(빌드/테스트) → `cd.yml`(SSH 배포, 시크릿 설정 시).

### 롤백

```bash
git checkout <직전 정상 커밋>
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 3. 장애 대응

### 디스코드 알림이 안 와요
1. `DISCORD_WEBHOOK_URL` 설정 확인.
2. `notification` 테이블 status 확인:
   - `PENDING` 다수 → 디스패처 미동작. 앱/스케줄러 로그 확인.
   - `FAILED/DEAD` → `last_error` 확인(레이트리밋/URL 오류).
3. 조치 후 재처리: `UPDATE notification SET status='PENDING', retry_count=0 WHERE status='DEAD';`

### 외부 API(디스코드/토스) 다운
- 알림: 아웃박스에 쌓이고 복구 후 자동 재발송 → **데이터 손실 없음**.
- 결제: 토스 승인 실패 시 주문은 READY 유지, 승인 재시도 가능.

### DB 다운
- 헬스체크 `DOWN`. 핵심 API 503. DB 복구가 1순위.
- 복구 후 미발송 알림은 디스패처가 자동 처리.

### 배치가 안 돌아요
- `job_log` 에 당일 `inactive-learner-reminder-{날짜}` 행 존재 여부 확인.
- 잘못된 실패행이 막고 있으면: 해당 `job_key` 행 삭제 후 다음 주기 대기(또는 앱 재기동).

---

## 4. 점검 엔드포인트

| 엔드포인트 | 권한 | 용도 |
| --- | --- | --- |
| `GET /actuator/health` | 공개 | 헬스체크(로드밸런서/모니터) |
| `GET /actuator/info` | 공개 | 앱/단계 정보 |
| `GET /actuator/metrics` | ADMIN | 메트릭 |
| `GET /api/v1/admin/stats` | ADMIN | 운영 통계 |
