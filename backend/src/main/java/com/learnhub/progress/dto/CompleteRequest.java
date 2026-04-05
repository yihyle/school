package com.learnhub.progress.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CompleteRequest {

    @NotNull(message = "userId is required")
    private Long userId;
}
