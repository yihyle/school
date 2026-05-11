# LearnHub P2 — 인증 규격서 (Auth Spec)

> 10주차 산출물: 토큰 · 헤더 · 에러 규격

---

## 1. 인증 방식

| 항목 | 값 |
|---|---|
| 방식 | JWT (JSON Web Token) — Stateless |
| 알고리즘 | HS256 |
| 라이브러리 | jjwt 0.12.3 |
| 시크릿 키 | `application.yml` → `jwt.secret` (운영 시 환경변수 분리) |

---

## 2. 토큰 규격

### Access Token

| 항목 | 값 |
|---|---|
| 만료 | 3,600,000ms (1시간) |
| 클레임 | `sub` (userId), `role`, `iat`, `exp` |
| 저장 위치 | 클라이언트 LocalStorage |
| 갱신 | 미구현 (만료 시 재로그인) |

### 클레임 예시

```json
{
  "sub": "1",
  "role": "STUDENT",
  "iat": 1715000000,
  "exp": 1715003600
}
```

---

## 3. 요청 헤더 규격

모든 인증이 필요한 API는 아래 헤더를 포함해야 합니다.

```
Authorization: Bearer <accessToken>
```

### Axios Interceptor 적용 위치

`frontend/src/lib/api/axios.ts` — Request Interceptor에서 LocalStorage의 토큰을 자동 첨부

---

## 4. 응답 규격

### 4.1 로그인 성공 (POST /api/v1/auth/login)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "kim@learnhub.io",
    "nickname": "김스프링",
    "role": "INSTRUCTOR"
  }
}
```

### 4.2 회원가입 성공 (POST /api/v1/auth/signup)

로그인과 동일한 `AuthResponse` 구조 반환 (즉시 로그인 처리)

### 4.3 내 정보 (GET /api/v1/auth/me)

```json
{
  "id": 1,
  "email": "kim@learnhub.io",
  "nickname": "김스프링",
  "role": "INSTRUCTOR",
  "createdAt": "2026-05-01T10:00:00"
}
```

---

## 5. 에러 응답 규격

모든 에러는 아래 형식으로 반환됩니다.

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "토큰이 만료되었습니다",
  "path": "/api/v1/auth/me"
}
```

### 에러 코드 테이블

| HTTP 상태 | 상황 | 메시지 예시 |
|---|---|---|
| 400 | 요청 검증 실패 | "비밀번호는 8자 이상이어야 합니다" |
| 401 | 토큰 없음 | "로그인이 필요합니다" |
| 401 | 토큰 만료 | "토큰이 만료되었습니다" |
| 401 | 토큰 변조 | "유효하지 않은 토큰입니다" |
| 401 | 자격 불일치 | "이메일 또는 비밀번호가 올바르지 않습니다" |
| 403 | 권한 부족 | "강사만 강의를 등록할 수 있습니다" |
| 403 | 소유권 없음 | "본인 강의만 수정할 수 있습니다" |
| 409 | 이메일 중복 | "이미 사용 중인 이메일입니다" |

---

## 6. 역할 (Role) 규격

| 역할 | 값 | Spring Security Authority |
|---|---|---|
| 학생 | `STUDENT` | `ROLE_STUDENT` |
| 강사 | `INSTRUCTOR` | `ROLE_INSTRUCTOR` |

### 경로별 접근 규칙 (SecurityConfig)

```
GET  /**                     → 익명 허용
POST /api/v1/auth/**         → 익명 허용
POST /api/v1/courses         → 인증 필요 (INSTRUCTOR 서비스 레이어 검증)
PATCH /api/v1/courses/**     → 인증 필요 (본인 강사 서비스 레이어 검증)
DELETE /api/v1/courses/**    → 인증 필요 (본인 강사 서비스 레이어 검증)
*                            → 인증 필요
```

---

## 7. 클라이언트 토큰 처리 흐름

```
로그인 성공
  └─ localStorage.setItem('learnhub_token', token)
  └─ Zustand useAuthStore.login(token, user)

이후 API 요청
  └─ axios request interceptor → Authorization: Bearer 헤더 자동 첨부

401 응답 수신
  └─ axios response interceptor
      └─ localStorage.removeItem('learnhub_token')
      └─ useAuthStore.logout()
      └─ router.push('/login')

로그아웃
  └─ localStorage.removeItem('learnhub_token')
  └─ useAuthStore.logout()
  └─ router.push('/')
```
