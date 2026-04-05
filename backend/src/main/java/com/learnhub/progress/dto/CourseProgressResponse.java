package com.learnhub.progress.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CourseProgressResponse {

    private Long courseId;
    private String courseTitle;
    private int totalLectures;
    private int completedLectures;
    private double progressRate;
    private List<LectureProgressResponse> lectureProgresses;
}
