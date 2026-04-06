-- Users
INSERT INTO `user` (email, password, nickname, profile_image, role) VALUES
('instructor1@learnhub.com', '$2a$10$dummyhashpassword1', '김스프링', 'https://i.pravatar.cc/150?img=1', 'INSTRUCTOR'),
('instructor2@learnhub.com', '$2a$10$dummyhashpassword2', '이리액트', 'https://i.pravatar.cc/150?img=2', 'INSTRUCTOR'),
('student1@learnhub.com',   '$2a$10$dummyhashpassword3', '박학생',   'https://i.pravatar.cc/150?img=3', 'STUDENT');

-- Courses
INSERT INTO course (title, description, thumbnail_url, category, level, instructor_id, price, is_published, enrollment_count) VALUES
('Spring Boot 완전 정복',
 'Spring Boot 3.x를 처음부터 끝까지 배우는 강의입니다. REST API 설계, JPA, Security까지 실무 중심으로 배웁니다.',
 'https://via.placeholder.com/640x360/4CAF50/FFFFFF?text=Spring+Boot',
 'BACKEND', 'BEGINNER', 1, 0, TRUE, 320),

('React 실전 프로젝트',
 'React 18과 TypeScript를 활용한 실전 프로젝트 강의입니다. 상태 관리부터 배포까지 경험합니다.',
 'https://via.placeholder.com/640x360/2196F3/FFFFFF?text=React',
 'FRONTEND', 'INTERMEDIATE', 2, 0, TRUE, 215),

('Docker & Kubernetes 입문',
 '컨테이너 기술의 핵심 Docker와 Kubernetes를 실습 중심으로 학습합니다.',
 'https://via.placeholder.com/640x360/00BCD4/FFFFFF?text=Docker+K8s',
 'DEVOPS', 'INTERMEDIATE', 1, 0, TRUE, 178),

('Java 알고리즘 마스터',
 '코딩테스트를 위한 Java 알고리즘 문제 풀이 강의입니다. 자료구조부터 동적 프로그래밍까지.',
 'https://via.placeholder.com/640x360/FF9800/FFFFFF?text=Algorithm',
 'CS', 'ADVANCED', 1, 0, TRUE, 412),

('Vue.js 3 기초와 실전',
 'Vue.js 3 Composition API를 중심으로 SPA 개발을 배웁니다.',
 'https://via.placeholder.com/640x360/9C27B0/FFFFFF?text=Vue.js',
 'FRONTEND', 'BEGINNER', 2, 0, TRUE, 134),

('MySQL 성능 최적화',
 '실무에서 자주 발생하는 MySQL 성능 문제를 진단하고 해결하는 방법을 배웁니다.',
 'https://via.placeholder.com/640x360/F44336/FFFFFF?text=MySQL',
 'DATABASE', 'ADVANCED', 1, 0, TRUE, 98);

-- Sections for Course 1 (Spring Boot)
INSERT INTO section (course_id, title, sort_order) VALUES
(1, '섹션 1: 환경 설정 및 프로젝트 생성', 1),
(1, '섹션 2: REST API 개발', 2),
(1, '섹션 3: Spring Data JPA', 3);

-- Lectures for Course 1, Section 1
INSERT INTO lecture (section_id, title, video_url, duration, sort_order, is_preview) VALUES
(1, 'Spring Boot 소개 및 설치', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 600, 1, TRUE),
(1, 'Spring Initializr로 프로젝트 생성', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 720, 2, FALSE),
(1, 'application.yml 설정 이해하기', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 540, 3, FALSE);

-- Lectures for Course 1, Section 2
INSERT INTO lecture (section_id, title, video_url, duration, sort_order, is_preview) VALUES
(2, '@RestController와 @GetMapping 이해', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 900, 1, FALSE),
(2, 'Request 파라미터 처리하기', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 840, 2, FALSE),
(2, '예외 처리와 GlobalExceptionHandler', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 960, 3, FALSE);

-- Lectures for Course 1, Section 3
INSERT INTO lecture (section_id, title, video_url, duration, sort_order, is_preview) VALUES
(3, 'JPA Entity 설계', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1020, 1, FALSE),
(3, 'Repository와 JPQL 작성', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 2, FALSE),
(3, '연관관계 매핑 실습', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1080, 3, FALSE);

-- Sections for Course 2 (React)
INSERT INTO section (course_id, title, sort_order) VALUES
(2, '섹션 1: React 기초', 1),
(2, '섹션 2: 상태 관리', 2);

-- Lectures for Course 2, Section 4
INSERT INTO lecture (section_id, title, video_url, duration, sort_order, is_preview) VALUES
(4, 'React 18 새로운 기능', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 780, 1, TRUE),
(4, 'JSX와 컴포넌트 이해', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 660, 2, FALSE),
(4, 'Hook: useState와 useEffect', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 3, FALSE);

-- Lectures for Course 2, Section 5
INSERT INTO lecture (section_id, title, video_url, duration, sort_order, is_preview) VALUES
(5, 'Context API로 전역 상태 관리', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 840, 1, FALSE),
(5, 'Redux Toolkit 입문', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1020, 2, FALSE);

-- Sections for Course 3 (Docker)
INSERT INTO section (course_id, title, sort_order) VALUES
(3, '섹션 1: Docker 기초', 1),
(3, '섹션 2: Kubernetes 입문', 2);

-- Lectures for Course 3, Section 6
INSERT INTO lecture (section_id, title, video_url, duration, sort_order, is_preview) VALUES
(6, 'Docker 개념과 설치', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 720, 1, TRUE),
(6, 'Dockerfile 작성법', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 840, 2, FALSE),
(6, 'Docker Compose 실습', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 960, 3, FALSE);

-- Lectures for Course 3, Section 7
INSERT INTO lecture (section_id, title, video_url, duration, sort_order, is_preview) VALUES
(7, 'Kubernetes 아키텍처 이해', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 1, FALSE),
(7, 'Pod와 Deployment 생성', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 1080, 2, FALSE);

-- Enrollment: student1 enrolled in course 1 and course 2
INSERT INTO enrollment (user_id, course_id, is_completed, progress_rate, last_accessed_at) VALUES
(3, 1, FALSE, 33.33, NOW()),
(3, 2, FALSE, 0.00, NOW());

-- Lecture progress for student1 on course 1
INSERT INTO lecture_progress (user_id, lecture_id, last_position, is_completed, completed_at) VALUES
(3, 1, 600, TRUE, NOW()),
(3, 2, 300, FALSE, NULL),
(3, 3, 0, FALSE, NULL);
