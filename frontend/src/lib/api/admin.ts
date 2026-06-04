import apiClient from './axios';
import type { AdminStats, AdminUser, AdminCourse } from '@/types';

export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await apiClient.get('/api/v1/admin/stats');
  return res.data;
};

export const listAdminUsers = async (keyword?: string): Promise<AdminUser[]> => {
  const res = await apiClient.get('/api/v1/admin/users', {
    params: keyword ? { keyword } : undefined,
  });
  return res.data;
};

export const updateUserRole = async (userId: number, role: string): Promise<AdminUser> => {
  const res = await apiClient.patch(`/api/v1/admin/users/${userId}/role`, { role });
  return res.data;
};

export const setUserActive = async (userId: number, active: boolean): Promise<AdminUser> => {
  const res = await apiClient.patch(`/api/v1/admin/users/${userId}/active`, { active });
  return res.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/users/${userId}`);
};

export const listAdminCourses = async (): Promise<AdminCourse[]> => {
  const res = await apiClient.get('/api/v1/admin/courses');
  return res.data;
};

export const toggleCoursePublish = async (courseId: number): Promise<AdminCourse> => {
  const res = await apiClient.patch(`/api/v1/admin/courses/${courseId}/publish`);
  return res.data;
};

export const deleteCourseAdmin = async (courseId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/courses/${courseId}`);
};
