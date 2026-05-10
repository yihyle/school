import apiClient from './axios';
import type { InstructorCourse, CreateCourseRequest } from '@/types';

export const getMyCourses = async (): Promise<InstructorCourse[]> => {
  const response = await apiClient.get('/api/v1/courses/me');
  return response.data;
};

export const createCourse = async (data: CreateCourseRequest): Promise<InstructorCourse> => {
  const response = await apiClient.post('/api/v1/courses', data);
  return response.data;
};

export const updateCourse = async (
  courseId: number,
  data: Partial<CreateCourseRequest>
): Promise<InstructorCourse> => {
  const response = await apiClient.patch(`/api/v1/courses/${courseId}`, data);
  return response.data;
};

export const deleteCourse = async (courseId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/courses/${courseId}`);
};

export const addSection = async (
  courseId: number,
  data: { title: string; sortOrder?: number }
) => {
  const response = await apiClient.post(`/api/v1/courses/${courseId}/sections`, data);
  return response.data;
};

export const addLecture = async (
  sectionId: number,
  data: { title: string; videoUrl?: string; duration?: number; sortOrder?: number; isPreview?: boolean }
) => {
  const response = await apiClient.post(`/api/v1/sections/${sectionId}/lectures`, data);
  return response.data;
};
