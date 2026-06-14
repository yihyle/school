'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import type { TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { getCourseDetail } from '@/lib/api/courses';
import { createOrder } from '@/lib/api/payments';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '';

/**
 * 토스페이먼츠 결제위젯(v2) 체크아웃 페이지.
 * 1) 백엔드에 주문(READY) 생성 → orderId/amount 확보
 * 2) 결제위젯 렌더링(결제수단 + 약관)
 * 3) 결제 요청 → 토스 결제창 → successUrl/failUrl 로 리다이렉트
 */
export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const router = useRouter();
  const { user } = useAuthStore();

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        const { courseId: rawId } = await searchParams;
        const courseId = Number(rawId);
        if (!rawId || Number.isNaN(courseId)) {
          setError('잘못된 접근입니다.');
          return;
        }
        if (!user) {
          router.replace('/login');
          return;
        }

        const course = await getCourseDetail(courseId);
        if (!course.price || course.price <= 0) {
          // 무료 강의는 결제 불필요 → 상세로 되돌림
          router.replace(`/courses/${courseId}`);
          return;
        }

        // 1) 주문 생성 (금액·orderId 는 서버가 결정 → 위변조 방지)
        const order = await createOrder(courseId);
        if (cancelled) return;

        setCourseTitle(course.title);
        setAmount(order.amount);
        setOrderId(order.orderId);

        // 2) 결제위젯 렌더링
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        await widgets.setAmount({ currency: 'KRW', value: order.amount });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
          widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
        ]);
        if (cancelled) return;
        widgetsRef.current = widgets;
        setReady(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('결제 준비 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    };

    setup();
    return () => {
      cancelled = true;
    };
  }, [searchParams, user, router]);

  const handlePay = async () => {
    if (!widgetsRef.current || !orderId || !user) return;
    setRequesting(true);
    try {
      // 3) 결제 요청 → 토스 결제창 → successUrl/failUrl 로 리다이렉트
      await widgetsRef.current.requestPayment({
        orderId,
        orderName: courseTitle,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
        customerEmail: user.email,
        customerName: user.nickname,
      });
    } catch (e) {
      console.error(e);
      setRequesting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-[#717171] text-lg mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-[#222222] mb-1">결제하기</h1>
        <p className="text-[#717171] mb-8">{courseTitle || '강의'}</p>

        {amount !== null && (
          <div className="flex items-center justify-between p-5 mb-6 bg-[#F7F7F7] rounded-2xl">
            <span className="text-[#717171]">결제 금액</span>
            <span className="text-xl font-bold text-[#222222]">{formatPrice(amount)}</span>
          </div>
        )}

        {/* 토스 결제위젯이 렌더링되는 영역 */}
        <div id="payment-method" />
        <div id="agreement" className="mt-4" />

        {!ready && <LoadingSpinner />}

        <button
          onClick={handlePay}
          disabled={!ready || requesting}
          className="w-full mt-6 py-3.5 bg-[#3B82F6] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {requesting ? '결제창 여는 중...' : amount !== null ? `${formatPrice(amount)} 결제하기` : '결제하기'}
        </button>

        <p className="mt-4 text-xs text-[#717171] text-center">
          테스트 결제입니다. 토스 테스트 카드로 실제 금액 청구 없이 결제됩니다.
        </p>
      </div>
    </div>
  );
}
