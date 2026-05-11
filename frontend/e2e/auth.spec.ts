import { test, expect } from '@playwright/test';

/**
 * TC-AUTH-02: 로그인 성공 → 보호 라우트(/dashboard) 접근
 *
 * 전제 조건: 백엔드 서버 실행 중, 아래 시드 계정 존재
 *   email: student@learnhub.io / password: password123
 */
test.describe('인증 (Authentication)', () => {
  test('TC-AUTH-02: 로그인 성공 후 대시보드 접근', async ({ page }) => {
    // 1. 로그인 페이지 접속
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // 2. 이메일 · 비밀번호 입력
    await page.getByLabel(/이메일/i).fill('student@learnhub.io');
    await page.getByLabel(/비밀번호/i).fill('password123');

    // 3. 로그인 버튼 클릭
    await page.getByRole('button', { name: /로그인/i }).click();

    // 4. 메인 또는 대시보드로 리다이렉트 확인
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 5000 });

    // 5. /dashboard 접속 — 리다이렉트 없이 정상 표시 확인
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('대시보드')).toBeVisible();
  });

  test('TC-AUTH-03: 잘못된 비밀번호로 로그인 시도', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/이메일/i).fill('student@learnhub.io');
    await page.getByLabel(/비밀번호/i).fill('wrongpassword');
    await page.getByRole('button', { name: /로그인/i }).click();

    // 에러 메시지 표시, 페이지 유지
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/올바르지 않습니다|실패|오류/i)).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-04: 미로그인 상태에서 /dashboard 접근 시 /login 리다이렉트', async ({ page }) => {
    // LocalStorage 초기화 (토큰 없음)
    await page.context().clearCookies();
    await page.goto('/dashboard');

    // /login 으로 리다이렉트 기대
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('TC-AUTH-05: 로그아웃', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill('student@learnhub.io');
    await page.getByLabel(/비밀번호/i).fill('password123');
    await page.getByRole('button', { name: /로그인/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 5000 });

    // 헤더 드롭다운 열기
    await page.getByRole('button', { name: /사용자 메뉴/i }).click();

    // 로그아웃 클릭
    await page.getByRole('button', { name: /로그아웃/i }).click();

    // 로그인 버튼이 다시 표시되어야 함
    await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible({ timeout: 5000 });
  });
});

/**
 * TC-RBAC-02: 학생 계정으로 /instructor 접근 시 리다이렉트
 */
test.describe('권한 (RBAC)', () => {
  test('TC-RBAC-02: 학생이 /instructor 접근 시 /dashboard로 리다이렉트', async ({ page }) => {
    // 학생 로그인
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill('student@learnhub.io');
    await page.getByLabel(/비밀번호/i).fill('password123');
    await page.getByRole('button', { name: /로그인/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 5000 });

    // /instructor 접근
    await page.goto('/instructor');

    // /dashboard로 리다이렉트 확인
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });
});
