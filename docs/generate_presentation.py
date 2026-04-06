#!/usr/bin/env python3
"""LearnHub P1 발표자료 PDF 생성 - HTML/WeasyPrint 기반"""

import os
from weasyprint import HTML

OUTPUT = os.path.join(os.path.dirname(__file__), "P1-발표자료.pdf")

html_content = """
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  @page {
    size: 297mm 210mm;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
    color: #222;
    -webkit-font-smoothing: antialiased;
  }

  .slide {
    width: 297mm;
    height: 210mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    padding: 0;
  }
  .slide:last-child { page-break-after: avoid; }

  /* ── Cover ── */
  .cover {
    background: #18181b;
    display: flex;
    align-items: center;
    padding: 0 60px;
  }
  .cover .deco1 {
    position: absolute; right: -40px; top: -60px;
    width: 300px; height: 300px; border-radius: 50%;
    background: #3B82F6; opacity: 0.8;
  }
  .cover .deco2 {
    position: absolute; right: 80px; bottom: -50px;
    width: 200px; height: 200px; border-radius: 50%;
    background: #6366F1; opacity: 0.6;
  }
  .cover .content { position: relative; z-index: 1; }
  .cover .tag {
    display: inline-block; background: #3B82F6; color: #fff;
    font-size: 12px; font-weight: 600; padding: 5px 16px;
    border-radius: 20px; margin-bottom: 20px;
  }
  .cover h1 { color: #fff; font-size: 56px; font-weight: 800; line-height: 1.1; }
  .cover p { color: #a1a1aa; font-size: 20px; margin-top: 16px; }

  /* ── TOC ── */
  .toc {
    background: #fff;
    padding: 50px 60px;
  }
  .toc .accent { position: absolute; left: 0; top: 0; width: 6px; height: 100%; background: #3B82F6; }
  .toc h2 { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
  .toc .line { height: 1px; background: #e5e5e5; margin-bottom: 30px; }
  .toc .item {
    display: flex; align-items: center; gap: 18px;
    margin-bottom: 28px;
  }
  .toc .num {
    width: 36px; height: 36px; border-radius: 50%; background: #3B82F6;
    color: #fff; font-size: 15px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .toc .item span { font-size: 20px; }

  /* ── Section Title ── */
  .section-title {
    background: #18181b;
    padding: 0 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .section-title .num { color: #3B82F6; font-size: 80px; font-weight: 800; line-height: 1; }
  .section-title .bar { width: 80px; height: 4px; background: #3B82F6; margin: 20px 0; }
  .section-title h2 { color: #fff; font-size: 38px; font-weight: 700; }

  /* ── Content Slide ── */
  .content-slide {
    background: #fff;
    padding: 0 60px;
    padding-top: 20px;
  }
  .content-slide .top-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #3B82F6;
  }
  .content-slide h2 {
    font-size: 26px; font-weight: 700; margin-bottom: 10px; padding-top: 16px;
  }
  .content-slide .divider { height: 1px; background: #e5e5e5; margin-bottom: 20px; }
  .content-slide ul { list-style: none; padding: 0; }
  .content-slide ul li {
    font-size: 16px; line-height: 1.6; padding: 4px 0; padding-left: 20px;
    position: relative;
  }
  .content-slide ul li::before {
    content: ""; position: absolute; left: 0; top: 12px;
    width: 7px; height: 7px; border-radius: 50%; background: #3B82F6;
  }
  .content-slide ul li.sub {
    padding-left: 40px; color: #717171; font-size: 15px;
  }
  .content-slide ul li.sub::before { left: 22px; background: #d4d4d4; width: 5px; height: 5px; }
  .content-slide ul li.header {
    color: #3B82F6; font-weight: 700; font-size: 17px;
    padding-left: 0; margin-top: 10px;
  }
  .content-slide ul li.header::before { display: none; }
  .content-slide ul li.spacer { padding: 0; height: 8px; }
  .content-slide ul li.spacer::before { display: none; }

  /* ── Two Column ── */
  .two-col {
    background: #fff;
    padding: 20px 60px 0;
  }
  .two-col .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #3B82F6; }
  .two-col h2 { font-size: 26px; font-weight: 700; margin-bottom: 10px; padding-top: 16px; }
  .two-col .divider { height: 1px; background: #e5e5e5; margin-bottom: 20px; }
  .two-col .cols { display: flex; gap: 20px; }
  .two-col .col {
    flex: 1; background: #f7f7f7; border-radius: 16px; padding: 24px;
  }
  .two-col .col h3 { color: #3B82F6; font-size: 18px; font-weight: 700; margin-bottom: 14px; }
  .two-col .col ul { list-style: none; padding: 0; }
  .two-col .col ul li {
    font-size: 15px; padding: 5px 0 5px 18px; position: relative;
  }
  .two-col .col ul li::before {
    content: ""; position: absolute; left: 0; top: 12px;
    width: 6px; height: 6px; border-radius: 50%; background: #3B82F6;
  }

  /* ── Scenario ── */
  .scenario {
    background: #fff;
    padding: 20px 60px 0;
  }
  .scenario .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #3B82F6; }
  .scenario h2 { font-size: 26px; font-weight: 700; margin-bottom: 10px; padding-top: 16px; }
  .scenario .divider { height: 1px; background: #e5e5e5; margin-bottom: 24px; }
  .scenario .step {
    display: flex; align-items: flex-start; gap: 16px; margin-bottom: 6px;
  }
  .scenario .step-left {
    display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 36px;
  }
  .scenario .step-num {
    width: 32px; height: 32px; border-radius: 50%; background: #3B82F6;
    color: #fff; font-size: 14px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .scenario .step-line { width: 2px; height: 16px; background: #e5e5e5; margin-top: 4px; }
  .scenario .step-text { font-size: 16px; padding-top: 5px; line-height: 1.5; }
  .scenario .step-text strong { color: #3B82F6; }

  /* ── End ── */
  .end {
    background: #18181b;
    display: flex; align-items: center; justify-content: center;
    text-align: center;
  }
  .end .deco1 {
    position: absolute; left: -40px; bottom: -30px;
    width: 240px; height: 240px; border-radius: 50%;
    background: #3B82F6; opacity: 0.7;
  }
  .end .deco2 {
    position: absolute; right: -20px; top: -40px;
    width: 180px; height: 180px; border-radius: 50%;
    background: #6366F1; opacity: 0.5;
  }
  .end h1 { color: #fff; font-size: 52px; font-weight: 800; position: relative; z-index: 1; }
  .end p { color: #a1a1aa; font-size: 22px; margin-top: 16px; position: relative; z-index: 1; }
</style>
</head>
<body>

<!-- 1. 표지 -->
<div class="slide cover">
  <div class="deco1"></div>
  <div class="deco2"></div>
  <div class="content">
    <div class="tag">프로젝트 실습</div>
    <h1>LearnHub</h1>
    <p>개발자를 위한 온라인 학습 플랫폼 &nbsp;|&nbsp; P1 발표</p>
  </div>
</div>

<!-- 2. 목차 -->
<div class="slide toc">
  <div class="accent"></div>
  <h2>목차</h2>
  <div class="line"></div>
  <div class="item"><div class="num">1</div><span>프로젝트 개요</span></div>
  <div class="item"><div class="num">2</div><span>주요 기능</span></div>
  <div class="item"><div class="num">3</div><span>기술 스택</span></div>
  <div class="item"><div class="num">4</div><span>시연 시나리오</span></div>
</div>

<!-- 3. 섹션: 프로젝트 개요 -->
<div class="slide section-title">
  <div class="num">01</div>
  <div class="bar"></div>
  <h2>프로젝트 개요</h2>
</div>

<!-- 4. 프로젝트 소개 -->
<div class="slide content-slide">
  <div class="top-bar"></div>
  <h2>LearnHub이란?</h2>
  <div class="divider"></div>
  <ul>
    <li>개발자와 IT 전문가를 위한 온라인 강의 플랫폼</li>
    <li>실무 중심의 프로그래밍 강의 제공</li>
    <li>인프런 등 검증된 플랫폼 UX를 참고한 직관적 인터페이스</li>
    <li class="spacer"></li>
    <li class="header">P1 구현 범위</li>
    <li class="sub">강의 탐색 → 수강 신청 → 학습 진행의 핵심 플로우</li>
    <li class="sub">검색, 카테고리 필터링, 인기 강의 추천</li>
    <li class="sub">비디오 학습 + 자동 진도 저장 + 이어보기</li>
    <li class="sub">회원가입 / 로그인 (기본 인증)</li>
    <li class="sub">반응형 디자인 (모바일 + 데스크톱)</li>
    <li class="sub">Airbnb에서 영감을 받은 깔끔한 UI/UX</li>
  </ul>
</div>

<!-- 5. 섹션: 주요 기능 -->
<div class="slide section-title">
  <div class="num">02</div>
  <div class="bar"></div>
  <h2>주요 기능</h2>
</div>

<!-- 6. 주요 기능 - 강의/수강 -->
<div class="slide content-slide">
  <div class="top-bar"></div>
  <h2>주요 기능 - 강의 탐색 및 수강</h2>
  <div class="divider"></div>
  <ul>
    <li class="header">강의 탐색</li>
    <li class="sub">전체 강의 목록 조회</li>
    <li class="sub">카테고리별 필터링 (백엔드, 프론트엔드, 모바일, AI/ML 등)</li>
    <li class="sub">강의명 / 강사명 키워드 검색</li>
    <li class="sub">인기 강의 추천 (수강생 수 기준)</li>
    <li class="spacer"></li>
    <li class="header">강의 상세 및 수강</li>
    <li class="sub">강의 소개, 커리큘럼 (섹션 → 영상), 강사 정보</li>
    <li class="sub">수강 신청 / 내 강의실 / 수강 취소</li>
    <li class="sub">수강 중복 방지 (DB 제약조건)</li>
  </ul>
</div>

<!-- 7. 주요 기능 - 학습/사용자 -->
<div class="slide content-slide">
  <div class="top-bar"></div>
  <h2>주요 기능 - 학습 및 사용자 관리</h2>
  <div class="divider"></div>
  <ul>
    <li class="header">비디오 학습</li>
    <li class="sub">React Player 기반 영상 재생 (YouTube 등 지원)</li>
    <li class="sub">10초 간격 자동 진도 저장</li>
    <li class="sub">마지막 시청 위치에서 이어보기</li>
    <li class="sub">90% 이상 시청 시 자동 완강 처리</li>
    <li class="sub">이전/다음 강의 네비게이션, 사이드바 목차</li>
    <li class="spacer"></li>
    <li class="header">사용자 관리</li>
    <li class="sub">회원가입 (닉네임, 이메일, 비밀번호)</li>
    <li class="sub">로그인 / 로그아웃 (localStorage 인증 유지)</li>
    <li class="sub">학습 대시보드 (전체/완료/진행중 강의, 평균 진도율)</li>
  </ul>
</div>

<!-- 8. API 엔드포인트 -->
<div class="slide content-slide">
  <div class="top-bar"></div>
  <h2>API 엔드포인트 (15개)</h2>
  <div class="divider"></div>
  <ul>
    <li class="header">강의 (3개)</li>
    <li class="sub">GET /courses — 목록 (카테고리, 검색 필터)</li>
    <li class="sub">GET /courses/trending — 인기 강의</li>
    <li class="sub">GET /courses/{id} — 상세 (섹션 + 영상 포함)</li>
    <li class="header">수강 (3개)</li>
    <li class="sub">POST /enrollments, GET /enrollments/my-courses, DELETE /enrollments/{id}</li>
    <li class="header">학습 진도 (4개)</li>
    <li class="sub">GET /lectures/{id}, PATCH .../progress, POST .../complete, GET /courses/{id}/progress</li>
    <li class="header">사용자 (3개)</li>
    <li class="sub">GET /users/{id}, PATCH /users/{id}, GET /users/{id}/dashboard</li>
    <li class="header">인증 (2개)</li>
    <li class="sub">POST /auth/signup, POST /auth/login</li>
  </ul>
</div>

<!-- 9. 섹션: 기술 스택 -->
<div class="slide section-title">
  <div class="num">03</div>
  <div class="bar"></div>
  <h2>기술 스택</h2>
</div>

<!-- 10. 기술 스택 -->
<div class="slide two-col">
  <div class="top-bar"></div>
  <h2>기술 스택</h2>
  <div class="divider"></div>
  <div class="cols">
    <div class="col">
      <h3>Backend</h3>
      <ul>
        <li>Spring Boot 3.2.4</li>
        <li>Java 17</li>
        <li>Spring Data JPA + Hibernate</li>
        <li>MySQL (Flyway 마이그레이션)</li>
        <li>Springdoc OpenAPI (Swagger UI)</li>
        <li>Gradle</li>
      </ul>
    </div>
    <div class="col">
      <h3>Frontend</h3>
      <ul>
        <li>Next.js 16 (App Router)</li>
        <li>TypeScript</li>
        <li>Tailwind CSS</li>
        <li>Zustand (상태 관리)</li>
        <li>Axios (HTTP 클라이언트)</li>
        <li>React Player (영상 재생)</li>
      </ul>
    </div>
  </div>
</div>

<!-- 11. 섹션: 시연 시나리오 -->
<div class="slide section-title">
  <div class="num">04</div>
  <div class="bar"></div>
  <h2>시연 시나리오</h2>
</div>

<!-- 12. 시연 시나리오 -->
<div class="slide scenario">
  <div class="top-bar"></div>
  <h2>시연 시나리오</h2>
  <div class="divider"></div>

  <div class="step">
    <div class="step-left"><div class="step-num">1</div><div class="step-line"></div></div>
    <div class="step-text"><strong>회원가입</strong> — 닉네임, 이메일, 비밀번호 입력 후 가입</div>
  </div>
  <div class="step">
    <div class="step-left"><div class="step-num">2</div><div class="step-line"></div></div>
    <div class="step-text"><strong>로그인</strong> — 이메일/비밀번호로 로그인, 헤더에 사용자 표시</div>
  </div>
  <div class="step">
    <div class="step-left"><div class="step-num">3</div><div class="step-line"></div></div>
    <div class="step-text"><strong>홈 화면</strong> — 카테고리 탐색, 인기 강의 확인</div>
  </div>
  <div class="step">
    <div class="step-left"><div class="step-num">4</div><div class="step-line"></div></div>
    <div class="step-text"><strong>강의 검색</strong> — 키워드/카테고리로 강의 찾기</div>
  </div>
  <div class="step">
    <div class="step-left"><div class="step-num">5</div><div class="step-line"></div></div>
    <div class="step-text"><strong>강의 상세</strong> — 커리큘럼 확인 후 수강 신청</div>
  </div>
  <div class="step">
    <div class="step-left"><div class="step-num">6</div><div class="step-line"></div></div>
    <div class="step-text"><strong>비디오 학습</strong> — 영상 재생, 자동 진도 저장, 이어보기</div>
  </div>
  <div class="step">
    <div class="step-left"><div class="step-num">7</div><div class="step-line"></div></div>
    <div class="step-text"><strong>내 강의실</strong> — 수강 중인 강의 목록, 진도율 확인</div>
  </div>
  <div class="step">
    <div class="step-left"><div class="step-num">8</div><div class="step-line"></div></div>
    <div class="step-text"><strong>대시보드</strong> — 학습 통계 확인 (전체/완료/진행중)</div>
  </div>
</div>

<!-- 13. 감사합니다 -->
<div class="slide end">
  <div class="deco1"></div>
  <div class="deco2"></div>
  <div>
    <h1>감사합니다</h1>
    <p>Q &amp; A</p>
  </div>
</div>

</body>
</html>
"""


def main():
    HTML(string=html_content).write_pdf(OUTPUT)
    print(f"PDF 생성 완료: {OUTPUT}")


if __name__ == "__main__":
    main()
