import apiClient from './axios';
import type { Enrollment } from '@/types';

export const enrollCourse = async (
  userId: number = 1,
  courseId: number
): Promise<Enrollment> => {
  const response = await apiClient.post('/api/v1/enrollments', { userId, courseId });
  return response.data;
};

export const getMyCourses = async (userId: number = 1): Promise<Enrollment[]> => {
  const response = await apiClient.get('/api/v1/enrollments/my-courses', {
    params: { userId },
  });
  return response.data;
};

export const cancelEnrollment = async (enrollmentId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/enrollments/${enrollmentId}`);
};
