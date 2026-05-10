package com.learnhub.section.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CreateSectionRequest {

    @NotBlank(message = "섹션 제목은 필수입니다")
    private String title;

    private Integer sortOrder;
}
