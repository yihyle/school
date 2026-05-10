import apiClient from './axios';
import type { Enrollment, MyCourseResponse } from '@/types';

export const enrollCourse = async (courseId: number): Promise<Enrollment> => {
  const response = await apiClient.post('/api/v1/enrollments', { courseId });
  return response.data;
};

export const getMyCourses = async (): Promise<MyCourseResponse[]> => {
  const response = await apiClient.get('/api/v1/enrollments/my-courses');
  return response.data;
};

export const cancelEnrollment = async (enrollmentId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/enrollments/${enrollmentId}`);
};
