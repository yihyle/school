package com.learnhub.course.dto;

import com.learnhub.course.Course;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CourseListResponse {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String category;
    private String level;
    private String instructorNickname;
    private Integer price;
    private Integer enrollmentCount;
    private LocalDateTime createdAt;

    public static CourseListResponse from(Course course) {
        return CourseListResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .category(course.getCategory())
                .level(course.getLevel())
                .instructorNickname(course.getInstructor() != null ? course.getInstructor().getNickname() : null)
                .price(course.getPrice())
                .enrollmentCount(course.getEnrollmentCount())
                .createdAt(course.getCreatedAt())
                .build();
    }
}
