import apiClient from './axios';
import type { User } from '@/types';

export async function signup(email: string, password: string, nickname: string): Promise<User> {
  const response = await apiClient.post<User>('/api/v1/auth/signup', { email, password, nickname });
  return response.data;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await apiClient.post<User>('/api/v1/auth/login', { email, password });
  return response.data;
}
