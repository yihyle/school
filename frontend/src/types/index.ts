// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  nickname: string;
  email: string;
  profileImage?: string;
  role?: string;
  createdAt: string;
}

export interface UserDashboard {
  userId: number;
  nickname: string;
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  overallProgressRate: number;
}

// ─── Course ──────────────────────────────────────────────────────────────────

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  level: string;
  instructorNickname: string;
  price: number;
  enrollmentCount?: number;
  createdAt?: string;
}

export interface Lecture {
  id: number;
  title: string;
  videoUrl: string;
  duration: number;
  sortOrder: number;
  sectionId?: number;
  preview?: boolean;
  lastPosition?: number;
  completed?: boolean;
}

export interface Section {
  id: number;
  title: string;
  sortOrder: number;
  lectures: Lecture[];
}

export interface CourseDetail extends Course {
  sections: Section[];
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  lastAccessedAt?: string;
  completed?: boolean;
  progressRate?: number;
  course?: Course;
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface CourseProgress {
  courseId: number;
  totalLectures: number;
  completedLectures: number;
  progressRate: number;
  lectures?: LectureProgress[];
}

export interface LectureProgress {
  lectureId: number;
  lastPosition: number;
  completed: boolean;
}
