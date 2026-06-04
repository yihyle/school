package com.learnhub.notification;

/** 알림 발송 상태 상수. */
public final class NotificationStatus {
    public static final String PENDING = "PENDING"; // 발송 대기
    public static final String SENT    = "SENT";    // 발송 성공
    public static final String FAILED  = "FAILED";  // 실패(재시도 대상)
    public static final String DEAD    = "DEAD";    // 최대 재시도 초과(더 이상 시도 안 함)

    private NotificationStatus() {}
}
