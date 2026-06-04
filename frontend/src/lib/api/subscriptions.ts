import apiClient from './axios';

export interface Subscription {
  id: number;
  courseId: number;
  channel: string;
  createdAt: string;
}

export const getMySubscriptions = async (): Promise<Subscription[]> => {
  const res = await apiClient.get('/api/v1/subscriptions');
  return res.data;
};

export const isSubscribed = async (courseId: number): Promise<boolean> => {
  const res = await apiClient.get(`/api/v1/subscriptions/courses/${courseId}`);
  return res.data.subscribed;
};

export const subscribeCourse = async (courseId: number): Promise<Subscription> => {
  const res = await apiClient.post(`/api/v1/subscriptions/courses/${courseId}`);
  return res.data;
};

export const unsubscribeCourse = async (courseId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/subscriptions/courses/${courseId}`);
};
