import apiClient from './axios';
import type { AuthResponse, User } from '@/types';

export async function signup(
  email: string,
  password: string,
  nickname: string,
  role: string = 'STUDENT'
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/signup', {
    email,
    password,
    nickname,
    role,
  });
  return response.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password });
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/api/v1/auth/me');
  return response.data;
}
