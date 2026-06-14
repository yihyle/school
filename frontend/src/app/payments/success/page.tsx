'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmPayment } from '@/lib/api/payments';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type Status = 'confirming' | 'success' | 'error';

/**
 * 토스 결제창에서 인증 성공 후 돌아오는 리다이렉트 페이지.
 * 쿼리(paymentKey, orderId, amount)를 백엔드 승인 API로 전달 → PAID + 수강 자동 등록.
 * 백엔드가 주문 금액과 승인 금액을 검증하므로 위변조는 서버에서 차단된다.
 */
export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('confirming');
  const [courseTitle, setCourseTitle] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const done = useRef(false);

  useEffect(() => {
    const confirm = async () => {
      if (done.current) return; // 중복 승인 방지(StrictMode 재실행 가드)
      done.current = true;
      try {
        const { paymentKey, orderId, amount } = await searchParams;
        if (!orderId || !amount) {
          setStatus('error');
          setMessage('결제 정보가 올바르지 않습니다.');
          return;
        }
        const res = await confirmPayment(orderId, Number(amount), paymentKey);
        setCourseTitle(res.courseTitle);
        setPaidAmount(res.amount);
        setStatus('success');
      } catch (e: unknown) {
        const detail =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setMessage(detail ?? '결제 승인에 실패했습니다.');
        setStatus('error');
      }
    };
    confirm();
  }, [searchParams]);

  if (status === 'confirming') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <LoadingSpinner />
        <p className="text-[#717171] mt-6">결제를 확인하고 있습니다...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-[#222222] mb-2">결제에 실패했어요</h1>
        <p className="text-[#717171] mb-8">{message}</p>
        <button
          onClick={() => router.push('/courses')}
          className="px-6 py-3 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors"
        >
          강의 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-[#222222] mb-2">결제가 완료되었어요!</h1>
      <p className="text-[#717171] mb-1">{courseTitle}</p>
      {paidAmount !== null && (
        <p className="text-lg font-bold text-[#222222] mb-8">{formatPrice(paidAmount)} 결제 완료</p>
      )}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => router.push('/my-courses')}
          className="px-6 py-3 bg-[#3B82F6] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
        >
          내 강의 보기
        </button>
        <button
          onClick={() => router.push('/courses')}
          className="px-6 py-3 bg-[#F7F7F7] text-[#222222] font-semibold rounded-xl hover:bg-[#EBEBEB] transition-colors"
        >
          강의 더 둘러보기
        </button>
      </div>
    </div>
  );
}
