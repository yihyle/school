package com.learnhub.lecture.dto;

import com.learnhub.lecture.Lecture;
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

    public static LectureResponse from(Lecture lecture) {
        return LectureResponse.builder()
                .id(lecture.getId())
                .sectionId(lecture.getSection() != null ? lecture.getSection().getId() : null)
                .title(lecture.getTitle())
                .videoUrl(lecture.getVideoUrl())
                .duration(lecture.getDuration())
                .sortOrder(lecture.getSortOrder())
                .isPreview(lecture.isPreview())
                .build();
    }
}
