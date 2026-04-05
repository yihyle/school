CREATE TABLE IF NOT EXISTS `user` (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  profile_image VARCHAR(500),
  role VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  thumbnail_url VARCHAR(500),
  category VARCHAR(100),
  level VARCHAR(50),
  instructor_id BIGINT,
  price INT,
  is_published BOOLEAN DEFAULT FALSE,
  enrollment_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES `user`(id)
);

CREATE TABLE IF NOT EXISTS section (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT,
  title VARCHAR(255),
  sort_order INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id)
);

CREATE TABLE IF NOT EXISTS lecture (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  section_id BIGINT,
  title VARCHAR(255),
  video_url VARCHAR(500),
  duration INT,
  sort_order INT,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES section(id)
);

CREATE TABLE IF NOT EXISTS enrollment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  course_id BIGINT,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_completed BOOLEAN DEFAULT FALSE,
  progress_rate DECIMAL(5,2),
  last_accessed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES `user`(id),
  FOREIGN KEY (course_id) REFERENCES course(id),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lecture_progress (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  lecture_id BIGINT,
  last_position INT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES `user`(id),
  FOREIGN KEY (lecture_id) REFERENCES lecture(id),
  UNIQUE (user_id, lecture_id)
);
