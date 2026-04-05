import apiClient from './axios';
import type { Course, CourseDetail, CourseProgress } from '@/types';

export const getCourses = async (params?: {
  category?: string;
  keyword?: string;
}): Promise<Course[]> => {
  const response = await apiClient.get('/api/v1/courses', { params });
  return response.data;
};

export const getTrendingCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get('/api/v1/courses/trending');
  return response.data;
};

export const getCourseDetail = async (courseId: number): Promise<CourseDetail> => {
  const response = await apiClient.get(`/api/v1/courses/${courseId}`);
  return response.data;
};

export const getCourseProgress = async (
  courseId: number,
  userId: number = 1
): Promise<CourseProgress> => {
  const response = await apiClient.get(`/api/v1/courses/${courseId}/progress`, {
    params: { userId },
  });
  return response.data;
};
