'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 토스 결제창에서 결제 실패/취소 시 돌아오는 리다이렉트 페이지.
 * 쿼리(code, message)로 실패 사유를 보여준다.
 */
export default function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const router = useRouter();
  const [reason, setReason] = useState('결제가 취소되었거나 실패했습니다.');

  useEffect(() => {
    searchParams.then(({ message }) => {
      if (message) setReason(message);
    });
  }, [searchParams]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-[#222222] mb-2">결제를 완료하지 못했어요</h1>
      <p className="text-[#717171] mb-8">{reason}</p>
      <button
        onClick={() => router.back()}
        className="px-6 py-3 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors"
      >
        다시 시도하기
      </button>
    </div>
  );
}
