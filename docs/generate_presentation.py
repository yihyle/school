#!/usr/bin/env python3
"""LearnHub P1 발표자료 PDF 생성 - 모던 디자인"""

from fpdf import FPDF
import os

FONT_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
OUTPUT = os.path.join(os.path.dirname(__file__), "P1-발표자료.pdf")

# Colors
BLACK = (34, 34, 34)
WHITE = (255, 255, 255)
BLUE = (59, 130, 246)
LIGHT_BLUE = (219, 234, 254)
GRAY = (113, 113, 113)
LIGHT_GRAY = (247, 247, 247)
DARK = (24, 24, 27)
ACCENT = (99, 102, 241)  # indigo


class Presentation(FPDF):
    def __init__(self):
        super().__init__(orientation="L", unit="mm", format="A4")
        self.add_font("kr", "", FONT_PATH)
        self.add_font("kr", "B", FONT_PATH)
        self.set_auto_page_break(auto=False)

    def _bg(self, color=WHITE):
        self.set_fill_color(*color)
        self.rect(0, 0, 297, 210, "F")

    def _pill(self, x, y, w, h, text, bg=BLUE, fg=WHITE, size=10):
        self.set_fill_color(*bg)
        self.set_draw_color(*bg)
        r = h / 2
        # rounded rect approximation
        self.rect(x + r, y, w - h, h, "F")
        self.ellipse(x, y, h, h, "F")
        self.ellipse(x + w - h, y, h, h, "F")
        self.set_text_color(*fg)
        self.set_font("kr", "B", size)
        self.set_xy(x, y)
        self.cell(w, h, text, align="C")

    def _line(self, y, color=LIGHT_GRAY):
        self.set_draw_color(*color)
        self.set_line_width(0.3)
        self.line(25, y, 272, y)

    # ── Slide types ──────────────────────────────────────────────

    def cover_slide(self, title, subtitle, tag=""):
        self.add_page()
        self._bg(DARK)
        # Decorative circles
        self.set_fill_color(59, 130, 246)
        self.set_draw_color(59, 130, 246)
        self.ellipse(200, -40, 160, 160, "F")
        self.set_fill_color(99, 102, 241)
        self.ellipse(240, 100, 120, 120, "F")
        # Tag
        if tag:
            self._pill(25, 55, 80, 10, tag, bg=BLUE, fg=WHITE, size=9)
        # Title
        self.set_text_color(*WHITE)
        self.set_font("kr", "B", 44)
        self.set_y(72)
        self.set_x(25)
        self.cell(200, 22, title, new_x="LMARGIN", new_y="NEXT")
        # Subtitle
        self.set_font("kr", "", 18)
        self.set_text_color(180, 180, 190)
        self.set_y(100)
        self.set_x(25)
        self.cell(200, 12, subtitle, new_x="LMARGIN", new_y="NEXT")

    def toc_slide(self, items):
        self.add_page()
        self._bg()
        # Left accent bar
        self.set_fill_color(*BLUE)
        self.rect(0, 0, 6, 210, "F")
        # Title
        self.set_text_color(*BLACK)
        self.set_font("kr", "B", 28)
        self.set_xy(30, 30)
        self.cell(0, 14, "목차")
        self._line(50)
        # Items
        y = 62
        for i, item in enumerate(items, 1):
            # Number circle
            self.set_fill_color(*BLUE)
            self.set_draw_color(*BLUE)
            self.ellipse(32, y - 1, 12, 12, "F")
            self.set_text_color(*WHITE)
            self.set_font("kr", "B", 11)
            self.set_xy(32, y - 1)
            self.cell(12, 12, str(i), align="C")
            # Text
            self.set_text_color(*BLACK)
            self.set_font("kr", "", 17)
            self.set_xy(52, y)
            self.cell(0, 10, item)
            y += 28

    def section_slide(self, number, title):
        self.add_page()
        self._bg(DARK)
        # Large number
        self.set_text_color(59, 130, 246)
        self.set_font("kr", "B", 80)
        self.set_xy(25, 40)
        self.cell(60, 40, f"0{number}")
        # Line
        self.set_draw_color(59, 130, 246)
        self.set_line_width(1)
        self.line(25, 95, 100, 95)
        # Title
        self.set_text_color(*WHITE)
        self.set_font("kr", "B", 34)
        self.set_xy(25, 105)
        self.cell(250, 18, title)

    def content_slide(self, title, items):
        self.add_page()
        self._bg()
        # Top accent line
        self.set_fill_color(*BLUE)
        self.rect(0, 0, 297, 4, "F")
        # Title
        self.set_text_color(*BLACK)
        self.set_font("kr", "B", 24)
        self.set_xy(25, 18)
        self.cell(0, 14, title)
        self._line(38)
        # Items
        self.set_font("kr", "", 14)
        y = 48
        for item in items:
            if y > 190:
                break
            if item == "":
                y += 6
                continue
            if item.startswith("  "):
                # Sub-item
                self.set_text_color(*GRAY)
                self.set_font("kr", "", 13)
                self.set_xy(40, y)
                self.cell(0, 9, item.strip())
                self.set_font("kr", "", 14)
                y += 12
            elif item.endswith(":"):
                # Section header
                self.set_text_color(*BLUE)
                self.set_font("kr", "B", 14)
                self.set_xy(25, y)
                self.cell(0, 9, item)
                self.set_font("kr", "", 14)
                self.set_text_color(*BLACK)
                y += 14
            else:
                self.set_text_color(*BLACK)
                self.set_xy(25, y)
                # Bullet
                self.set_fill_color(*BLUE)
                self.ellipse(27, y + 3.5, 3, 3, "F")
                self.set_xy(34, y)
                self.cell(0, 9, item)
                y += 13

    def two_col_slide(self, title, left_title, left_items, right_title, right_items):
        self.add_page()
        self._bg()
        # Top accent
        self.set_fill_color(*BLUE)
        self.rect(0, 0, 297, 4, "F")
        # Title
        self.set_text_color(*BLACK)
        self.set_font("kr", "B", 24)
        self.set_xy(25, 18)
        self.cell(0, 14, title)
        self._line(38)
        # Left column bg
        self.set_fill_color(*LIGHT_GRAY)
        self.rect(20, 46, 125, 148, "F")
        # Left title
        self.set_text_color(*BLUE)
        self.set_font("kr", "B", 16)
        self.set_xy(30, 54)
        self.cell(0, 10, left_title)
        # Left items
        self.set_text_color(*BLACK)
        self.set_font("kr", "", 12)
        y = 70
        for item in left_items:
            self.set_fill_color(*BLUE)
            self.ellipse(33, y + 2.5, 2.5, 2.5, "F")
            self.set_xy(40, y)
            self.cell(100, 8, item)
            y += 13
        # Right column bg
        self.set_fill_color(*LIGHT_GRAY)
        self.rect(152, 46, 125, 148, "F")
        # Right title
        self.set_text_color(*BLUE)
        self.set_font("kr", "B", 16)
        self.set_xy(162, 54)
        self.cell(0, 10, right_title)
        # Right items
        self.set_text_color(*BLACK)
        self.set_font("kr", "", 12)
        y = 70
        for item in right_items:
            self.set_fill_color(*BLUE)
            self.ellipse(165, y + 2.5, 2.5, 2.5, "F")
            self.set_xy(172, y)
            self.cell(100, 8, item)
            y += 13

    def card_grid_slide(self, title, cards):
        """cards: list of (card_title, card_desc)"""
        self.add_page()
        self._bg()
        self.set_fill_color(*BLUE)
        self.rect(0, 0, 297, 4, "F")
        self.set_text_color(*BLACK)
        self.set_font("kr", "B", 24)
        self.set_xy(25, 18)
        self.cell(0, 14, title)
        self._line(38)

        cols = 3
        card_w = 78
        card_h = 60
        gap = 6
        start_x = 25
        start_y = 48

        for i, (ct, cd) in enumerate(cards):
            col = i % cols
            row = i // cols
            x = start_x + col * (card_w + gap)
            y = start_y + row * (card_h + gap)
            if y + card_h > 200:
                break
            # Card bg
            self.set_fill_color(*LIGHT_GRAY)
            self.rect(x, y, card_w, card_h, "F")
            # Card accent
            self.set_fill_color(*BLUE)
            self.rect(x, y, 3, card_h, "F")
            # Card title
            self.set_text_color(*BLACK)
            self.set_font("kr", "B", 12)
            self.set_xy(x + 8, y + 8)
            self.cell(card_w - 12, 8, ct)
            # Card desc
            self.set_text_color(*GRAY)
            self.set_font("kr", "", 10)
            lines = cd.split("\n")
            ly = y + 20
            for line in lines:
                self.set_xy(x + 8, ly)
                self.cell(card_w - 12, 7, line)
                ly += 9

    def scenario_slide(self, title, steps):
        """steps: list of (step_num, description)"""
        self.add_page()
        self._bg()
        self.set_fill_color(*BLUE)
        self.rect(0, 0, 297, 4, "F")
        self.set_text_color(*BLACK)
        self.set_font("kr", "B", 24)
        self.set_xy(25, 18)
        self.cell(0, 14, title)
        self._line(38)

        y = 50
        for num, desc in steps:
            if y > 188:
                break
            # Step circle
            self.set_fill_color(*BLUE)
            self.set_draw_color(*BLUE)
            self.ellipse(28, y, 14, 14, "F")
            self.set_text_color(*WHITE)
            self.set_font("kr", "B", 11)
            self.set_xy(28, y)
            self.cell(14, 14, str(num), align="C")
            # Connector line
            if num < len(steps):
                self.set_draw_color(200, 200, 200)
                self.set_line_width(0.5)
                self.line(35, y + 14, 35, y + 26)
            # Text
            self.set_text_color(*BLACK)
            self.set_font("kr", "", 14)
            self.set_xy(50, y + 1)
            self.cell(220, 10, desc)
            y += 28

    def end_slide(self, title, subtitle=""):
        self.add_page()
        self._bg(DARK)
        # Decorative
        self.set_fill_color(59, 130, 246)
        self.ellipse(-30, 100, 140, 140, "F")
        self.set_fill_color(99, 102, 241)
        self.ellipse(220, -30, 120, 120, "F")
        # Title
        self.set_text_color(*WHITE)
        self.set_font("kr", "B", 42)
        self.set_y(75)
        self.cell(0, 22, title, align="C", new_x="LMARGIN", new_y="NEXT")
        if subtitle:
            self.set_font("kr", "", 18)
            self.set_text_color(180, 180, 190)
            self.set_y(105)
            self.cell(0, 12, subtitle, align="C")


def main():
    pdf = Presentation()

    # ── 1. 표지 ──
    pdf.cover_slide(
        "LearnHub",
        "개발자를 위한 온라인 학습 플랫폼  |  P1 발표",
        tag="프로젝트 실습"
    )

    # ── 2. 목차 ──
    pdf.toc_slide([
        "프로젝트 개요",
        "주요 기능",
        "기술 스택",
        "시연 시나리오",
    ])

    # ── 3. 프로젝트 개요 ──
    pdf.section_slide(1, "프로젝트 개요")

    pdf.content_slide("LearnHub이란?", [
        "개발자와 IT 전문가를 위한 온라인 강의 플랫폼",
        "실무 중심의 프로그래밍 강의를 제공",
        "",
        "핵심 목표:",
        "  강의 탐색 → 수강 신청 → 학습 진행의 완전한 플로우",
        "  반응형 디자인으로 모바일 / 데스크톱 모두 지원",
        "  Airbnb에서 영감을 받은 깔끔한 UI/UX",
        "",
        "P1 범위:",
        "  강의 CRUD 및 탐색 (검색, 카테고리 필터)",
        "  수강 신청 / 취소 / 내 강의실",
        "  비디오 학습 + 자동 진도 저장",
        "  회원가입 / 로그인",
    ])

    pdf.content_slide("데이터베이스 설계 (6개 테이블)", [
        "user  —  사용자 (email, password, nickname, role)",
        "course  —  강의 (title, category, level, price)",
        "section  —  섹션 (course_id, title, sort_order)",
        "lecture  —  강의 영상 (video_url, duration)",
        "enrollment  —  수강 신청 (user_id, course_id, progress_rate)",
        "lecture_progress  —  학습 진도 (last_position, is_completed)",
        "",
        "주요 관계:",
        "  user 1:N course (강사가 강의 개설)",
        "  user 1:N enrollment (학생이 수강 신청)",
        "  course 1:N section 1:N lecture (강의 구조)",
        "",
        "제약조건:",
        "  UNIQUE(email), UNIQUE(user+course), UNIQUE(user+lecture)",
    ])

    # ── 4. 주요 기능 ──
    pdf.section_slide(2, "주요 기능")

    pdf.card_grid_slide("구현된 기능 (18개 항목 완료)", [
        ("강의 목록 조회", "전체 강의 조회\n카테고리 필터링\n키워드 검색"),
        ("인기 강의", "수강생 수 기준 정렬\n홈 화면 노출"),
        ("강의 상세", "커리큘럼 (섹션/영상)\n강사 정보\n수강 신청"),
        ("수강 관리", "수강 신청 / 취소\n내 강의실\n진도율 표시"),
        ("비디오 학습", "React Player 재생\n10초 간격 자동 저장\n이어보기"),
        ("완강 처리", "90% 이상 시청 시\n자동 완료 처리\n진도율 계산"),
        ("회원가입", "닉네임/이메일/비밀번호\n중복 이메일 검증"),
        ("로그인", "이메일/비밀번호 인증\nlocalStorage 유지"),
        ("대시보드", "전체/완료/진행중\n평균 진도율 통계"),
    ])

    pdf.content_slide("API 엔드포인트 (15개)", [
        "강의:",
        "  GET /courses — 목록 (카테고리, 검색)",
        "  GET /courses/trending — 인기 강의",
        "  GET /courses/{id} — 상세 (섹션+영상 포함)",
        "",
        "수강:",
        "  POST /enrollments — 수강 신청",
        "  GET /enrollments/my-courses — 내 수강 목록",
        "  DELETE /enrollments/{id} — 수강 취소",
        "",
        "학습:",
        "  PATCH /lectures/{id}/progress — 시청 위치 저장",
        "  POST /lectures/{id}/complete — 완료 처리",
        "  GET /courses/{id}/progress — 진도 조회",
        "",
        "인증:",
        "  POST /auth/signup, POST /auth/login",
    ])

    # ── 5. 기술 스택 ──
    pdf.section_slide(3, "기술 스택")

    pdf.two_col_slide("기술 스택",
        "Backend",
        [
            "Spring Boot 3.2.4",
            "Java 17",
            "Spring Data JPA",
            "MySQL (Flyway 마이그레이션)",
            "Swagger UI (API 문서)",
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

    pdf.content_slide("프론트엔드 페이지 구성 (9개)", [
        "/  —  홈 (카테고리 그리드, 인기 강의)",
        "/courses  —  강의 목록 (검색, 필터, 카드 그리드)",
        "/courses/[id]  —  강의 상세 (커리큘럼, 수강 신청)",
        "/my-courses  —  내 강의실 (진도율, 수강 취소)",
        "/learn/[courseId]/[lectureId]  —  학습 (비디오, 사이드바 목차)",
        "/dashboard  —  대시보드 (학습 통계)",
        "/login  —  로그인",
        "/signup  —  회원가입",
    ])

    # ── 6. 시연 시나리오 ──
    pdf.section_slide(4, "시연 시나리오")

    pdf.scenario_slide("시연 시나리오", [
        (1, "회원가입 → 닉네임, 이메일, 비밀번호 입력"),
        (2, "로그인 → 이메일/비밀번호로 로그인"),
        (3, "홈 화면 → 카테고리 탐색, 인기 강의 확인"),
        (4, "강의 검색 → 키워드/카테고리로 강의 찾기"),
        (5, "강의 상세 → 커리큘럼 확인, 수강 신청"),
        (6, "학습 → 비디오 재생, 자동 진도 저장, 이어보기"),
    ])

    pdf.scenario_slide("시연 시나리오 (계속)", [
        (7, "내 강의실 → 수강 중인 강의 목록, 진도율 확인"),
        (8, "대시보드 → 학습 통계 (전체/완료/진행중)"),
        (9, "수강 취소 → 내 강의실에서 수강 취소"),
        (10, "로그아웃 → 헤더 메뉴에서 로그아웃"),
    ])

    # ── 7. 감사합니다 ──
    pdf.end_slide("감사합니다", "Q & A")

    pdf.output(OUTPUT)
    print(f"PDF 생성 완료: {OUTPUT}")


if __name__ == "__main__":
    main()
