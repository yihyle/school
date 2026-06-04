-- 사용자 활성/비활성 플래그 (관리자가 차단 가능)
ALTER TABLE `user`
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role;

-- 댓글에 Q&A 타입과 해결 상태 추가
ALTER TABLE comment
  ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'GENERAL' AFTER content,
  ADD COLUMN resolved BOOLEAN NOT NULL DEFAULT FALSE AFTER type;

CREATE INDEX idx_comment_lecture_type ON comment (lecture_id, type);

-- ADMIN 시드 계정 (placeholder 해시 → PasswordInitializer가 admin1234로 인코딩)
INSERT INTO `user` (email, password, nickname, role, is_active, created_at, updated_at)
SELECT 'admin@learnhub.io', '$2a$10$dummy_admin_placeholder_replace_at_startup', '관리자', 'ADMIN', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email = 'admin@learnhub.io');
