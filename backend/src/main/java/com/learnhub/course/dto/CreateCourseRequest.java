package com.learnhub.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CreateCourseRequest {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    private String description;
    private String thumbnailUrl;

    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @NotBlank(message = "난이도는 필수입니다")
    private String level;

    private Integer price;
}
