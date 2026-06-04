package com.learnhub.subscription.dto;

import com.learnhub.subscription.Subscription;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SubscriptionResponse {
    private Long id;
    private Long courseId;
    private String channel;
    private LocalDateTime createdAt;

    public static SubscriptionResponse from(Subscription s) {
        return SubscriptionResponse.builder()
                .id(s.getId())
                .courseId(s.getCourseId())
                .channel(s.getChannel())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
