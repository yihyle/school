import apiClient from './axios';
import type { User, UserDashboard } from '@/types';

export const getUser = async (userId: number = 1): Promise<User> => {
  const response = await apiClient.get(`/api/v1/users/${userId}`);
  return response.data;
};

export const updateUser = async (
  userId: number = 1,
  data: { nickname?: string; profileImage?: string }
): Promise<User> => {
  const response = await apiClient.patch(`/api/v1/users/${userId}`, data);
  return response.data;
};

export const getUserDashboard = async (userId: number = 1): Promise<UserDashboard> => {
  const response = await apiClient.get(`/api/v1/users/${userId}/dashboard`);
  return response.data;
};
