-- =====================================================================
-- P3: 운영형 / 외부연동 + 관측성
--   - subscription  : 강의 알림 구독
--   - notification  : 아웃박스(Outbox) — 발송 상태/재시도/멱등키 관리
--   - payment       : 강의 결제 주문/승인 (토스/PortOne 연동 대비)
--   - job_log       : 스케줄러 배치 실행 로그 (멱등성 보장)
-- =====================================================================

-- 1) 강의 알림 구독 -----------------------------------------------------
CREATE TABLE subscription (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    course_id  BIGINT       NOT NULL,
    channel    VARCHAR(20)  NOT NULL DEFAULT 'DISCORD',
    created_at DATETIME     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sub_user   FOREIGN KEY (user_id)   REFERENCES `user` (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_course FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE,
    CONSTRAINT uq_sub_user_course UNIQUE (user_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) 알림 아웃박스 -----------------------------------------------------
CREATE TABLE notification (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NULL,            -- 운영자 알림(OPS_ALERT)은 대상 사용자가 없을 수 있음
    type        VARCHAR(40)  NOT NULL,        -- NEW_LECTURE / QNA_ANSWERED / INACTIVE_REMINDER / PAYMENT_PAID / OPS_ALERT
    channel     VARCHAR(20)  NOT NULL,        -- DISCORD / EMAIL
    title       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING / SENT / FAILED / DEAD
    retry_count INT          NOT NULL DEFAULT 0,
    dedup_key   VARCHAR(200) NOT NULL,        -- 멱등성: 동일 사건 중복 발송 방지
    last_error  VARCHAR(500) NULL,
    created_at  DATETIME     NOT NULL,
    sent_at     DATETIME     NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_noti_dedup UNIQUE (dedup_key),
    CONSTRAINT fk_noti_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_noti_status ON notification (status, created_at);

-- 3) 결제 ------------------------------------------------------------
CREATE TABLE payment (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    order_id    VARCHAR(64)  NOT NULL,        -- 자체 생성 주문번호 (멱등키)
    user_id     BIGINT       NOT NULL,
    course_id   BIGINT       NOT NULL,
    amount      INT          NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'READY', -- READY / PAID / CANCELLED / FAILED
    payment_key VARCHAR(200) NULL,            -- PG사 결제 키 (toss/portone)
    method      VARCHAR(40)  NULL,
    created_at  DATETIME     NOT NULL,
    paid_at     DATETIME     NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_pay_order UNIQUE (order_id),
    CONSTRAINT fk_pay_user   FOREIGN KEY (user_id)   REFERENCES `user` (id),
    CONSTRAINT fk_pay_course FOREIGN KEY (course_id) REFERENCES course (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pay_user ON payment (user_id, status);

-- 4) 배치 작업 로그 ----------------------------------------------------
CREATE TABLE job_log (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    job_name        VARCHAR(100) NOT NULL,
    job_key         VARCHAR(150) NOT NULL,    -- 예: inactive-reminder-2026-06-04 (실행 단위 멱등키)
    status          VARCHAR(20)  NOT NULL,    -- RUNNING / SUCCESS / FAILED
    processed_count INT          NOT NULL DEFAULT 0,
    message         VARCHAR(500) NULL,
    started_at      DATETIME     NOT NULL,
    finished_at     DATETIME     NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_job_key UNIQUE (job_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
