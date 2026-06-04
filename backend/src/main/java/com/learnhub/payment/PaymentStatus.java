package com.learnhub.payment;

/** 결제 상태 상수. */
public final class PaymentStatus {
    public static final String READY     = "READY";     // 주문 생성, 결제 대기
    public static final String PAID      = "PAID";      // 결제 완료
    public static final String CANCELLED = "CANCELLED"; // 취소
    public static final String FAILED    = "FAILED";    // 실패

    private PaymentStatus() {}
}
