package com.learnhub.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalStudents;
    private long totalInstructors;
    private long totalCourses;
    private long publishedCourses;
    private long totalEnrollments;
    private long totalComments;
    private long totalQuestions;
    private long unresolvedQuestions;
    private Map<String, Long> usersByRole;
    private Map<String, Long> coursesByCategory;
    private List<RecentUser> recentUsers;
    private List<TopCourse> topCourses;

    @Getter
    @Builder
    public static class RecentUser {
        private Long id;
        private String email;
        private String nickname;
        private String role;
        private String createdAt;
    }

    @Getter
    @Builder
    public static class TopCourse {
        private Long id;
        private String title;
        private String instructorNickname;
        private Integer enrollmentCount;
    }
}
