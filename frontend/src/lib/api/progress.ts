import apiClient from './axios';

export const saveProgress = async (
  lectureId: number,
  userId: number = 1,
  lastPosition: number
): Promise<void> => {
  await apiClient.patch(`/api/v1/lectures/${lectureId}/progress`, {
    userId,
    lastPosition,
  });
};

export const completeLecture = async (
  lectureId: number,
  userId: number = 1
): Promise<void> => {
  await apiClient.post(`/api/v1/lectures/${lectureId}/complete`, { userId });
};
