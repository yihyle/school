package com.learnhub.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardResponse {

    private Long userId;
    private String nickname;
    private int totalEnrolledCourses;
    private int completedCourses;
    private int inProgressCourses;
    private double overallProgressRate;
}
