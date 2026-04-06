# LearnHub ERD (Entity Relationship Diagram)

## ERD 다이어그램

```mermaid
erDiagram
    user {
        BIGINT id PK
        VARCHAR email UK "NOT NULL"
        VARCHAR password "NOT NULL"
        VARCHAR nickname
        VARCHAR profile_image
        VARCHAR role "STUDENT / INSTRUCTOR"
        DATETIME created_at
        DATETIME updated_at
    }

    course {
        BIGINT id PK
        VARCHAR title
        TEXT description
        VARCHAR thumbnail_url
        VARCHAR category "BACKEND / FRONTEND / MOBILE / AI_ML / CS 등"
        VARCHAR level "BEGINNER / INTERMEDIATE / ADVANCED"
        BIGINT instructor_id FK
        INT price
        BOOLEAN is_published
        INT enrollment_count "DEFAULT 0"
        DATETIME created_at
        DATETIME updated_at
    }

    section {
        BIGINT id PK
        BIGINT course_id FK
        VARCHAR title
        INT sort_order
        DATETIME created_at
    }

    lecture {
        BIGINT id PK
        BIGINT section_id FK
        VARCHAR title
        VARCHAR video_url
        INT duration "초 단위"
        INT sort_order
        BOOLEAN is_preview "DEFAULT FALSE"
        DATETIME created_at
    }

    enrollment {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT course_id FK
        DATETIME enrolled_at
        BOOLEAN is_completed "DEFAULT FALSE"
        DECIMAL progress_rate "0.00 ~ 100.00"
        DATETIME last_accessed_at
    }

    lecture_progress {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT lecture_id FK
        INT last_position "초 단위"
        BOOLEAN is_completed "DEFAULT FALSE"
        DATETIME completed_at
        DATETIME updated_at
    }

    user ||--o{ course : "강의 개설 (instructor)"
    user ||--o{ enrollment : "수강 신청"
    user ||--o{ lecture_progress : "학습 진도"
    course ||--o{ section : "섹션 구성"
    course ||--o{ enrollment : "수강"
    section ||--o{ lecture : "강의 영상"
    lecture ||--o{ lecture_progress : "진도 기록"
```

## 테이블 관계 설명

| 관계 | 설명 |
|------|------|
| user → course | 강사(instructor)가 강의를 개설 (1:N) |
| user → enrollment | 학생이 강의를 수강 신청 (1:N) |
| user → lecture_progress | 학생의 강의 영상별 학습 진도 (1:N) |
| course → section | 강의는 여러 섹션으로 구성 (1:N) |
| section → lecture | 섹션은 여러 강의 영상을 포함 (1:N) |
| course → enrollment | 강의에 여러 수강생 등록 (1:N) |
| lecture → lecture_progress | 영상별 진도 기록 (1:N) |

## 제약 조건

| 테이블 | 제약 | 설명 |
|--------|------|------|
| user | UNIQUE(email) | 이메일 중복 방지 |
| enrollment | UNIQUE(user_id, course_id) | 동일 강의 중복 수강 방지 |
| lecture_progress | UNIQUE(user_id, lecture_id) | 동일 영상 중복 진도 방지 |

## 시드 데이터 요약

| 테이블 | 건수 | 내용 |
|--------|------|------|
| user | 3 | 강사 2명 (김스프링, 이리액트), 학생 1명 (박학생) |
| course | 6 | Spring Boot, React, Vue.js, Algorithm, Docker+K8s, MySQL |
| section | 7 | 각 강의별 1~2개 섹션 |
| lecture | 20 | 각 섹션별 2~4개 영상 |
| enrollment | 2 | 박학생 → Spring Boot, React 수강 |
| lecture_progress | 3 | 일부 영상 시청 기록 |
