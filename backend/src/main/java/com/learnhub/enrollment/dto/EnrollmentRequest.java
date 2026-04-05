package com.learnhub.enrollment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EnrollmentRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "courseId is required")
    private Long courseId;
}
