package com.learnhub.course.dto;

import lombok.Getter;

@Getter
public class UpdateCourseRequest {
    private String title;
    private String description;
    private String thumbnailUrl;
    private String category;
    private String level;
    private Integer price;
}
