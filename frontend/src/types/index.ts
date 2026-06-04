// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

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

export interface MyCourseResponse {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  thumbnailUrl?: string;
  category: string;
  level: string;
  instructorNickname?: string;
  completed: boolean;
  progressRate?: number;
  enrolledAt: string;
  lastAccessedAt?: string;
}

// ─── Instructor ───────────────────────────────────────────────────────────────

export interface InstructorCourse {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  level: string;
  price: number;
  enrollmentCount: number;
  createdAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  level: string;
  price?: number;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalComments: number;
  totalQuestions: number;
  unresolvedQuestions: number;
  usersByRole: Record<string, number>;
  coursesByCategory: Record<string, number>;
  recentUsers: Array<{
    id: number;
    email: string;
    nickname: string;
    role: string;
    createdAt: string;
  }>;
  topCourses: Array<{
    id: number;
    title: string;
    instructorNickname: string;
    enrollmentCount: number;
  }>;
}

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminCourse {
  id: number;
  title: string;
  category: string;
  level: string;
  instructorNickname: string;
  instructorId: number;
  price: number;
  isPublished: boolean;
  enrollmentCount: number;
  createdAt: string;
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
