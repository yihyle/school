package com.learnhub.section.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CreateLectureRequest {

    @NotBlank(message = "강의 영상 제목은 필수입니다")
    private String title;

    private String videoUrl;
    private Integer duration;
    private Integer sortOrder;
    private Boolean isPreview;
}
