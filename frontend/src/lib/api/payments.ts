import apiClient from './axios';

export type PaymentStatus = 'READY' | 'PAID' | 'CANCELLED' | 'FAILED';

export interface PaymentResponse {
  orderId: string;
  courseId: number;
  courseTitle: string;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  createdAt: string;
  paidAt: string | null;
}

/** 1) 결제 주문 생성 (READY) */
export const createOrder = async (courseId: number): Promise<PaymentResponse> => {
  const res = await apiClient.post('/api/v1/payments/orders', { courseId });
  return res.data;
};

/** 2) 결제 승인 (PAID → 수강 자동 등록). MOCK 모드는 paymentKey 생략 가능. */
export const confirmPayment = async (
  orderId: string,
  amount: number,
  paymentKey?: string
): Promise<PaymentResponse> => {
  const res = await apiClient.post('/api/v1/payments/confirm', { orderId, amount, paymentKey });
  return res.data;
};
