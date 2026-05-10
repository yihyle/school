package com.learnhub.course.dto;

import com.learnhub.course.Course;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InstructorCourseResponse {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String category;
    private String level;
    private Integer price;
    private Boolean isPublished;
    private Integer enrollmentCount;
    private LocalDateTime createdAt;

    public static InstructorCourseResponse from(Course course) {
        return InstructorCourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .category(course.getCategory())
                .level(course.getLevel())
                .price(course.getPrice())
                .isPublished(course.getIsPublished())
                .enrollmentCount(course.getEnrollmentCount())
                .createdAt(course.getCreatedAt())
                .build();
    }
}
