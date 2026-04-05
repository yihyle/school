package com.learnhub.progress.dto;

import com.learnhub.progress.LectureProgress;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LectureProgressResponse {

    private Long lectureId;
    private String lectureTitle;
    private Integer lastPosition;
    private boolean isCompleted;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;

    public static LectureProgressResponse from(LectureProgress progress) {
        return LectureProgressResponse.builder()
                .lectureId(progress.getLecture().getId())
                .lectureTitle(progress.getLecture().getTitle())
                .lastPosition(progress.getLastPosition())
                .isCompleted(progress.isCompleted())
                .completedAt(progress.getCompletedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
