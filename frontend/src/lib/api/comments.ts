import apiClient from './axios';

export interface Comment {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImage: string | null;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  editable: boolean;
  createdAt: string;
  updatedAt: string | null;
  replies: Comment[];
}

export const listComments = async (lectureId: number, userId?: number): Promise<Comment[]> => {
  const res = await apiClient.get(`/api/v1/lectures/${lectureId}/comments`, {
    params: userId ? { userId } : undefined,
  });
  return res.data;
};

export const createComment = async (
  lectureId: number,
  userId: number,
  content: string,
  parentId?: number
): Promise<Comment> => {
  const res = await apiClient.post(`/api/v1/lectures/${lectureId}/comments`, {
    userId,
    content,
    parentId,
  });
  return res.data;
};

export const updateComment = async (
  commentId: number,
  userId: number,
  content: string
): Promise<Comment> => {
  const res = await apiClient.patch(`/api/v1/comments/${commentId}`, { userId, content });
  return res.data;
};

export const deleteComment = async (commentId: number, userId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/comments/${commentId}`, { params: { userId } });
};

export const likeComment = async (commentId: number, userId: number): Promise<number> => {
  const res = await apiClient.post(`/api/v1/comments/${commentId}/like`, { userId });
  return res.data.likeCount;
};

export const unlikeComment = async (commentId: number, userId: number): Promise<number> => {
  const res = await apiClient.delete(`/api/v1/comments/${commentId}/like`, { params: { userId } });
  return res.data.likeCount;
};
