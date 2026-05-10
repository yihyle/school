package com.learnhub.section.dto;

import com.learnhub.section.Section;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SectionResponse {

    private Long id;
    private Long courseId;
    private String title;
    private int sortOrder;

    public static SectionResponse from(Section section) {
        return SectionResponse.builder()
                .id(section.getId())
                .courseId(section.getCourse() != null ? section.getCourse().getId() : null)
                .title(section.getTitle())
                .sortOrder(section.getSortOrder())
                .build();
    }
}
