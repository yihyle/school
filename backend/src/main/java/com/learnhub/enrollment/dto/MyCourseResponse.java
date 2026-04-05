package com.learnhub.enrollment.dto;

import com.learnhub.enrollment.Enrollment;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class MyCourseResponse {

    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private String thumbnailUrl;
    private String category;
    private String level;
    private String instructorNickname;
    private boolean isCompleted;
    private BigDecimal progressRate;
    private LocalDateTime enrolledAt;
    private LocalDateTime lastAccessedAt;

    public static MyCourseResponse from(Enrollment enrollment) {
        return MyCourseResponse.builder()
                .enrollmentId(enrollment.getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .thumbnailUrl(enrollment.getCourse().getThumbnailUrl())
                .category(enrollment.getCourse().getCategory())
                .level(enrollment.getCourse().getLevel())
                .instructorNickname(enrollment.getCourse().getInstructor() != null
                        ? enrollment.getCourse().getInstructor().getNickname() : null)
                .isCompleted(enrollment.isCompleted())
                .progressRate(enrollment.getProgressRate())
                .enrolledAt(enrollment.getEnrolledAt())
                .lastAccessedAt(enrollment.getLastAccessedAt())
                .build();
    }
}
