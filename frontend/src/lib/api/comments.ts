import apiClient from './axios';

export type CommentType = 'GENERAL' | 'QUESTION';

export interface Comment {
  id: number;
  userId: number;
  userNickname: string;
  userProfileImage: string | null;
  userRole?: string;
  content: string;
  type: CommentType;
  resolved: boolean;
  likeCount: number;
  likedByMe: boolean;
  editable: boolean;
  createdAt: string;
  updatedAt: string | null;
  replies: Comment[];
}

export const listComments = async (
  lectureId: number,
  userId?: number,
  type?: CommentType
): Promise<Comment[]> => {
  const res = await apiClient.get(`/api/v1/lectures/${lectureId}/comments`, {
    params: {
      ...(userId ? { userId } : {}),
      ...(type ? { type } : {}),
    },
  });
  return res.data;
};

export const createComment = async (
  lectureId: number,
  userId: number,
  content: string,
  parentId?: number,
  type: CommentType = 'GENERAL'
): Promise<Comment> => {
  const res = await apiClient.post(`/api/v1/lectures/${lectureId}/comments`, {
    userId,
    content,
    parentId,
    type,
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

export const toggleResolveComment = async (commentId: number, userId: number): Promise<Comment> => {
  const res = await apiClient.patch(`/api/v1/comments/${commentId}/resolve`, { userId });
  return res.data;
};
