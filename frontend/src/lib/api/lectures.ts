import apiClient from './axios';
import type { Lecture } from '@/types';

export const getLecture = async (lectureId: number): Promise<Lecture> => {
  const response = await apiClient.get(`/api/v1/lectures/${lectureId}`);
  return response.data;
};
