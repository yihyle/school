package com.learnhub.course;

import com.learnhub.course.dto.CourseDetailResponse;
import com.learnhub.course.dto.CourseListResponse;
import com.learnhub.progress.dto.CourseProgressResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "강의 목록 API")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "강의 목록 조회", description = "카테고리, 키워드로 필터링 가능")
    public ResponseEntity<List<CourseListResponse>> getCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(courseService.getCourses(category, keyword));
    }

    @GetMapping("/trending")
    @Operation(summary = "인기 강의 목록 조회")
    public ResponseEntity<List<CourseListResponse>> getTrendingCourses() {
        return ResponseEntity.ok(courseService.getTrendingCourses());
    }

    @GetMapping("/{courseId}")
    @Operation(summary = "강의 상세 조회 (섹션 및 강의 포함)")
    public ResponseEntity<CourseDetailResponse> getCourseDetail(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourseDetail(courseId));
    }

    @GetMapping("/{courseId}/progress")
    @Operation(summary = "강의 진도 조회")
    public ResponseEntity<CourseProgressResponse> getCourseProgress(
            @PathVariable Long courseId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(courseService.getCourseProgress(courseId, userId));
    }
}
