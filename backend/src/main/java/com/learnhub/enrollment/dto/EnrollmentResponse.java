package com.learnhub.enrollment.dto;

import com.learnhub.enrollment.Enrollment;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class EnrollmentResponse {

    private Long id;
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
    private boolean isCompleted;
    private BigDecimal progressRate;
    private LocalDateTime lastAccessedAt;

    public static EnrollmentResponse from(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .enrolledAt(enrollment.getEnrolledAt())
                .isCompleted(enrollment.isCompleted())
                .progressRate(enrollment.getProgressRate())
                .lastAccessedAt(enrollment.getLastAccessedAt())
                .build();
    }
}
