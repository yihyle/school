package com.learnhub.course.dto;

import com.learnhub.course.Course;
import com.learnhub.lecture.Lecture;
import com.learnhub.section.Section;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class CourseDetailResponse {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String category;
    private String level;
    private String instructorNickname;
    private Integer price;
    private Integer enrollmentCount;
    private List<SectionDto> sections;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    public static class SectionDto {
        private Long id;
        private String title;
        private int sortOrder;
        private List<LectureDto> lectures;

        public static SectionDto from(Section section) {
            List<LectureDto> lectures = section.getLectures() != null
                    ? section.getLectures().stream()
                        .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                        .map(LectureDto::from)
                        .collect(Collectors.toList())
                    : List.of();
            return SectionDto.builder()
                    .id(section.getId())
                    .title(section.getTitle())
                    .sortOrder(section.getSortOrder())
                    .lectures(lectures)
                    .build();
        }
    }

    @Getter
    @Builder
    public static class LectureDto {
        private Long id;
        private String title;
        private Integer duration;
        private int sortOrder;
        private boolean isPreview;

        public static LectureDto from(Lecture lecture) {
            return LectureDto.builder()
                    .id(lecture.getId())
                    .title(lecture.getTitle())
                    .duration(lecture.getDuration())
                    .sortOrder(lecture.getSortOrder())
                    .isPreview(lecture.isPreview())
                    .build();
        }
    }

    public static CourseDetailResponse from(Course course, List<Section> sections) {
        List<SectionDto> sectionDtos = sections.stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(SectionDto::from)
                .collect(Collectors.toList());

        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .category(course.getCategory())
                .level(course.getLevel())
                .instructorNickname(course.getInstructor() != null ? course.getInstructor().getNickname() : null)
                .price(course.getPrice())
                .enrollmentCount(course.getEnrollmentCount())
                .sections(sectionDtos)
                .createdAt(course.getCreatedAt())
                .build();
    }
}
