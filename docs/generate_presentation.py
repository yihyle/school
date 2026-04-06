#!/usr/bin/env python3
"""LearnHub P1 발표자료 PDF 생성"""

from fpdf import FPDF
import os

# 한국어 폰트 경로 (macOS)
FONT_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
OUTPUT = os.path.join(os.path.dirname(__file__), "P1-발표자료.pdf")


class Presentation(FPDF):
    def __init__(self):
        super().__init__(orientation="L", unit="mm", format="A4")
        self.add_font("korean", "", FONT_PATH, uni=True)
        self.add_font("korean", "B", FONT_PATH, uni=True)
        self.set_auto_page_break(auto=False)

    def slide_bg(self, color=(255, 255, 255)):
        self.set_fill_color(*color)
        self.rect(0, 0, 297, 210, "F")

    def title_slide(self, title, subtitle=""):
        self.add_page()
        self.slide_bg((34, 34, 34))
        self.set_text_color(255, 255, 255)
        self.set_font("korean", "B", 40)
        self.set_y(65)
        self.cell(0, 20, title, align="C", new_x="LMARGIN", new_y="NEXT")
        if subtitle:
            self.set_font("korean", "", 18)
            self.set_text_color(180, 180, 180)
            self.set_y(95)
            self.cell(0, 12, subtitle, align="C", new_x="LMARGIN", new_y="NEXT")

    def section_slide(self, number, title):
        self.add_page()
        self.slide_bg((59, 130, 246))
        self.set_text_color(255, 255, 255)
        self.set_font("korean", "", 20)
        self.set_y(70)
        self.cell(0, 12, f"PART {number}", align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("korean", "B", 36)
        self.set_y(88)
        self.cell(0, 20, title, align="C", new_x="LMARGIN", new_y="NEXT")

    def content_slide(self, title, items, footnote=""):
        self.add_page()
        self.slide_bg()
        # Title bar
        self.set_fill_color(59, 130, 246)
        self.rect(0, 0, 297, 38, "F")
        self.set_text_color(255, 255, 255)
        self.set_font("korean", "B", 22)
        self.set_y(8)
        self.cell(0, 20, "  " + title, align="L", new_x="LMARGIN", new_y="NEXT")
        # Items
        self.set_text_color(34, 34, 34)
        self.set_font("korean", "", 15)
        y = 50
        for item in items:
            if y > 185:
                break
            self.set_y(y)
            self.set_x(25)
            self.cell(0, 10, f"•  {item}", new_x="LMARGIN", new_y="NEXT")
            y += 14
        if footnote:
            self.set_text_color(113, 113, 113)
            self.set_font("korean", "", 11)
            self.set_y(190)
            self.set_x(25)
            self.cell(0, 8, footnote)

    def two_col_slide(self, title, left_title, left_items, right_title, right_items):
        self.add_page()
        self.slide_bg()
        # Title bar
        self.set_fill_color(59, 130, 246)
        self.rect(0, 0, 297, 38, "F")
        self.set_text_color(255, 255, 255)
        self.set_font("korean", "B", 22)
        self.set_y(8)
        self.cell(0, 20, "  " + title, align="L", new_x="LMARGIN", new_y="NEXT")
        # Left column
        self.set_text_color(59, 130, 246)
        self.set_font("korean", "B", 16)
        self.set_y(48)
        self.set_x(20)
        self.cell(130, 10, left_title, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(34, 34, 34)
        self.set_font("korean", "", 13)
        y = 62
        for item in left_items:
            self.set_y(y)
            self.set_x(24)
            self.cell(130, 9, f"•  {item}", new_x="LMARGIN", new_y="NEXT")
            y += 12
        # Right column
        self.set_text_color(59, 130, 246)
        self.set_font("korean", "B", 16)
        self.set_y(48)
        self.set_x(158)
        self.cell(130, 10, right_title, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(34, 34, 34)
        self.set_font("korean", "", 13)
        y = 62
        for item in right_items:
            self.set_y(y)
            self.set_x(162)
            self.cell(130, 9, f"•  {item}", new_x="LMARGIN", new_y="NEXT")
            y += 12

    def table_slide(self, title, headers, rows):
        self.add_page()
        self.slide_bg()
        # Title bar
        self.set_fill_color(59, 130, 246)
        self.rect(0, 0, 297, 38, "F")
        self.set_text_color(255, 255, 255)
        self.set_font("korean", "B", 22)
        self.set_y(8)
        self.cell(0, 20, "  " + title, align="L", new_x="LMARGIN", new_y="NEXT")
        # Table
        col_count = len(headers)
        col_w = 250 / col_count
        start_x = 23
        y = 50
        # Header
        self.set_fill_color(240, 240, 240)
        self.set_text_color(34, 34, 34)
        self.set_font("korean", "B", 12)
        for i, h in enumerate(headers):
            self.set_xy(start_x + i * col_w, y)
            self.cell(col_w, 12, h, border=1, align="C", fill=True)
        y += 12
        # Rows
        self.set_font("korean", "", 11)
        for row in rows:
            if y > 185:
                break
            for i, val in enumerate(row):
                self.set_xy(start_x + i * col_w, y)
                self.cell(col_w, 11, str(val), border=1, align="C")
            y += 11


def main():
    pdf = Presentation()

    # 1. 표지
    pdf.title_slide("LearnHub", "온라인 학습 플랫폼  |  P1 발표")

    # 2. 목차
    pdf.content_slide("목차", [
        "1. 프로젝트 개요",
        "2. 기술 스택",
        "3. 시스템 아키텍처",
        "4. 데이터베이스 설계 (ERD)",
        "5. API 설계",
        "6. 주요 기능 시연",
        "7. 프론트엔드 페이지 구성",
        "8. 구현 현황",
        "9. 향후 계획 (P2)",
    ])

    # 3. 프로젝트 개요
    pdf.section_slide("01", "프로젝트 개요")

    pdf.content_slide("프로젝트 소개", [
        "서비스명: LearnHub (런허브)",
        "개발자/IT 전문가를 위한 온라인 강의 플랫폼",
        "실무 중심의 프로그래밍 강의 제공",
        "",
        "P1 범위:",
        "  강의 탐색 → 수강 신청 → 학습 진행의 핵심 플로우 완성",
        "  회원가입 / 로그인 기본 인증",
        "  반응형 디자인 (모바일 + 데스크톱)",
    ])

    pdf.content_slide("개발 배경 및 목표", [
        "개발 배경:",
        "  빠르게 변화하는 IT 기술 트렌드에 맞는 학습 환경 필요",
        "  강의 탐색부터 수강, 진도 관리까지 원활한 사용자 경험",
        "  인프런 등 검증된 플랫폼 UX 참고",
        "",
        "프로젝트 목표:",
        "  사용자 중심의 강의 플랫폼 MVP 구축",
        "  핵심 플로우 완성: 탐색 → 상세 → 수강 → 학습",
        "  Airbnb 스타일의 깔끔한 UI/UX",
    ])

    # 4. 기술 스택
    pdf.section_slide("02", "기술 스택")

    pdf.two_col_slide("기술 스택",
        "Backend",
        [
            "Spring Boot 3.2.4",
            "Java 17",
            "Spring Data JPA + Hibernate",
            "MySQL (Flyway 마이그레이션)",
            "Springdoc OpenAPI (Swagger)",
            "Gradle",
        ],
        "Frontend",
        [
            "Next.js 16 (App Router)",
            "TypeScript",
            "Tailwind CSS",
            "Zustand (상태 관리)",
            "Axios (HTTP 클라이언트)",
            "React Player (영상 재생)",
        ]
    )

    # 5. 시스템 아키텍처
    pdf.section_slide("03", "시스템 아키텍처")

    pdf.content_slide("시스템 구조", [
        "[Browser]  ←→  [Next.js Frontend :3000]  ←→  [Spring Boot API :8080]  ←→  [MySQL :3306]",
        "",
        "Frontend (Next.js 16):",
        "  App Router, Turbopack, 9개 페이지, Zustand 상태관리",
        "",
        "Backend (Spring Boot 3.2.4):",
        "  REST API 15개 엔드포인트, JPA, Flyway, Swagger UI",
        "",
        "Database (MySQL):",
        "  6개 테이블, Flyway 자동 마이그레이션, 시드 데이터",
    ])

    # 6. ERD
    pdf.section_slide("04", "데이터베이스 설계")

    pdf.table_slide("테이블 구조 (6개)",
        ["테이블", "설명", "주요 컬럼"],
        [
            ["user", "사용자", "email, password, nickname, role"],
            ["course", "강의", "title, category, level, price"],
            ["section", "섹션", "course_id, title, sort_order"],
            ["lecture", "강의 영상", "section_id, video_url, duration"],
            ["enrollment", "수강 신청", "user_id, course_id, progress_rate"],
            ["lecture_progress", "학습 진도", "user_id, lecture_id, last_position"],
        ]
    )

    pdf.content_slide("테이블 관계 및 제약조건", [
        "user  1:N  course       → 강사가 강의 개설",
        "user  1:N  enrollment   → 학생이 수강 신청",
        "user  1:N  lecture_progress → 학습 진도 기록",
        "course 1:N section      → 강의는 여러 섹션 포함",
        "section 1:N lecture     → 섹션은 여러 영상 포함",
        "",
        "제약조건:",
        "  UNIQUE(user.email)                  → 이메일 중복 방지",
        "  UNIQUE(enrollment: user_id, course_id)  → 중복 수강 방지",
        "  UNIQUE(lecture_progress: user_id, lecture_id) → 중복 진도 방지",
    ])

    # 7. API
    pdf.section_slide("05", "API 설계")

    pdf.table_slide("API 엔드포인트 (15개)",
        ["Method", "Path", "설명"],
        [
            ["GET", "/api/v1/courses", "강의 목록 (카테고리/검색)"],
            ["GET", "/api/v1/courses/trending", "인기 강의"],
            ["GET", "/api/v1/courses/{id}", "강의 상세 (섹션+영상)"],
            ["POST", "/api/v1/enrollments", "수강 신청"],
            ["GET", "/api/v1/enrollments/my-courses", "내 수강 목록"],
            ["DELETE", "/api/v1/enrollments/{id}", "수강 취소"],
            ["GET", "/api/v1/lectures/{id}", "영상 정보"],
            ["PATCH", "/api/v1/lectures/{id}/progress", "시청 위치 저장"],
            ["POST", "/api/v1/lectures/{id}/complete", "완료 처리"],
            ["GET", "/api/v1/courses/{id}/progress", "강의 진도 조회"],
            ["GET", "/api/v1/users/{id}", "프로필 조회"],
            ["PATCH", "/api/v1/users/{id}", "프로필 수정"],
            ["GET", "/api/v1/users/{id}/dashboard", "학습 대시보드"],
            ["POST", "/api/v1/auth/signup", "회원가입"],
            ["POST", "/api/v1/auth/login", "로그인"],
        ]
    )

    # 8. 주요 기능
    pdf.section_slide("06", "주요 기능")

    pdf.content_slide("강의 탐색 및 수강", [
        "강의 목록: 전체 조회, 카테고리 필터링, 키워드 검색",
        "인기 강의: 수강생 수 기준 정렬",
        "강의 상세: 커리큘럼 (섹션/영상), 강사 정보, 수강 신청",
        "수강 관리: 수강 신청, 내 강의실, 수강 취소",
        "",
        "학습 기능:",
        "  React Player 기반 영상 재생",
        "  10초 간격 자동 진도 저장",
        "  마지막 시청 위치에서 이어보기",
        "  90% 이상 시청 시 자동 완강 처리",
        "  이전/다음 강의 네비게이션",
    ])

    pdf.content_slide("사용자 관리", [
        "회원가입: 닉네임, 이메일, 비밀번호",
        "로그인: 이메일/비밀번호 인증",
        "인증 상태: localStorage 저장, 새로고침 유지",
        "프로필 조회 및 수정",
        "",
        "학습 대시보드:",
        "  전체 수강 강의 수",
        "  완료한 강의 수",
        "  학습 중인 강의 수",
        "  평균 진도율",
    ])

    # 9. 페이지 구성
    pdf.section_slide("07", "페이지 구성")

    pdf.table_slide("프론트엔드 페이지 (9개)",
        ["경로", "페이지", "주요 기능"],
        [
            ["/", "홈", "카테고리, 인기 강의"],
            ["/courses", "강의 목록", "검색, 필터, 카드 그리드"],
            ["/courses/[id]", "강의 상세", "커리큘럼, 수강 신청"],
            ["/my-courses", "내 강의실", "진도율, 수강 취소"],
            ["/learn/[c]/[l]", "학습", "비디오, 사이드바 목차"],
            ["/dashboard", "대시보드", "학습 통계"],
            ["/login", "로그인", "이메일/비밀번호"],
            ["/signup", "회원가입", "닉네임/이메일/비밀번호"],
        ]
    )

    # 10. 구현 현황
    pdf.section_slide("08", "구현 현황")

    pdf.table_slide("요구사항 구현 현황 (18/18 완료)",
        ["ID", "기능", "우선순위", "상태"],
        [
            ["F-01", "강의 목록 조회", "필수", "완료"],
            ["F-02", "카테고리 필터", "필수", "완료"],
            ["F-03", "강의 검색", "필수", "완료"],
            ["F-04", "인기 강의 추천", "선택", "완료"],
            ["F-05", "강의 상세 조회", "필수", "완료"],
            ["F-06", "수강 신청", "필수", "완료"],
            ["F-07", "내 강의실", "필수", "완료"],
            ["F-08", "수강 취소", "선택", "완료"],
            ["F-09", "영상 재생", "필수", "완료"],
            ["F-10", "진도 자동 저장", "필수", "완료"],
            ["F-11", "이어보기", "필수", "완료"],
            ["F-12", "진도율 계산", "필수", "완료"],
            ["F-13", "완강 처리", "선택", "완료"],
            ["F-14", "프로필 조회", "필수", "완료"],
        ]
    )

    # 11. 향후 계획
    pdf.section_slide("09", "향후 계획 (P2)")

    pdf.content_slide("P2 계획", [
        "인증/권한:",
        "  JWT 기반 인증 (Access + Refresh Token)",
        "  Spring Security 통합",
        "  BCrypt 비밀번호 암호화",
        "  역할 기반 접근 제어 (RBAC: 관리자/강사/학생)",
        "",
        "기능 확장:",
        "  강의 CRUD (강사용 관리 기능)",
        "  수강평/리뷰 기능",
        "  프로필 이미지 업로드",
        "  보호 라우트 (인증 필수 페이지)",
    ])

    # 12. 마무리
    pdf.title_slide("감사합니다", "LearnHub  |  Q&A")

    pdf.output(OUTPUT)
    print(f"PDF 생성 완료: {OUTPUT}")


if __name__ == "__main__":
    main()
