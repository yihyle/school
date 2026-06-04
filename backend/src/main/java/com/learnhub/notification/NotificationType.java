package com.learnhub.notification;

/** 알림 종류 상수. */
public final class NotificationType {
    public static final String NEW_LECTURE       = "NEW_LECTURE";       // 구독 강의에 새 영상 등록
    public static final String QNA_ANSWERED      = "QNA_ANSWERED";      // 내 질문에 답변(대댓글) 달림
    public static final String INACTIVE_REMINDER = "INACTIVE_REMINDER"; // 장기 미학습 리마인드
    public static final String PAYMENT_PAID      = "PAYMENT_PAID";      // 결제 완료
    public static final String OPS_ALERT         = "OPS_ALERT";         // 운영자 알림(가입/신규강의/오류 등)

    private NotificationType() {}
}
