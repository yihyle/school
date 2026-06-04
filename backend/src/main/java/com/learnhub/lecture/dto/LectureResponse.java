package com.learnhub.lecture.dto;

import com.learnhub.lecture.Lecture;
import com.learnhub.progress.LectureProgress;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LectureResponse {

    private Long id;
    private Long sectionId;
    private String title;
    private String videoUrl;
    private Integer duration;
    private int sortOrder;
    private boolean isPreview;
    private Integer lastPosition;
    private boolean completed;

    public static LectureResponse from(Lecture lecture) {
        return from(lecture, null);
    }

    public static LectureResponse from(Lecture lecture, LectureProgress progress) {
        return LectureResponse.builder()
                .id(lecture.getId())
                .sectionId(lecture.getSection() != null ? lecture.getSection().getId() : null)
                .title(lecture.getTitle())
                .videoUrl(lecture.getVideoUrl())
                .duration(lecture.getDuration())
                .sortOrder(lecture.getSortOrder())
                .isPreview(lecture.isPreview())
                .lastPosition(progress != null ? progress.getLastPosition() : null)
                .completed(progress != null && progress.isCompleted())
                .build();
    }
}
