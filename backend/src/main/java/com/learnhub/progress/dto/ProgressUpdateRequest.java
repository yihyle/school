package com.learnhub.progress.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProgressUpdateRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "lastPosition is required")
    private Integer lastPosition;
}
