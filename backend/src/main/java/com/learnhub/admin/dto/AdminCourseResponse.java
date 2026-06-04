package com.learnhub.admin.dto;

import com.learnhub.course.Course;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminCourseResponse {
    private Long id;
    private String title;
    private String category;
    private String level;
    private String instructorNickname;
    private Long instructorId;
    private Integer price;
    private Boolean isPublished;
    private Integer enrollmentCount;
    private LocalDateTime createdAt;

    public static AdminCourseResponse from(Course c) {
        return AdminCourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .category(c.getCategory())
                .level(c.getLevel())
                .instructorNickname(c.getInstructor() != null ? c.getInstructor().getNickname() : null)
                .instructorId(c.getInstructor() != null ? c.getInstructor().getId() : null)
                .price(c.getPrice())
                .isPublished(c.getIsPublished())
                .enrollmentCount(c.getEnrollmentCount())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
