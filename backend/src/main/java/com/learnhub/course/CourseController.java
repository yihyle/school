package com.learnhub.course;

import com.learnhub.course.dto.CourseDetailResponse;
import com.learnhub.course.dto.CourseListResponse;
import com.learnhub.course.dto.CreateCourseRequest;
import com.learnhub.course.dto.InstructorCourseResponse;
import com.learnhub.course.dto.UpdateCourseRequest;
import com.learnhub.progress.dto.CourseProgressResponse;
import com.learnhub.section.SectionService;
import com.learnhub.section.dto.CreateSectionRequest;
import com.learnhub.section.dto.SectionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "강의 API")
public class CourseController {

    private final CourseService courseService;
    private final SectionService sectionService;

    // ── 공개 API ───────────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "강의 목록 조회")
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
    @Operation(summary = "강의 상세 조회")
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

    // ── 강사 전용 API ──────────────────────────────────────────────────────────

    @GetMapping("/me")
    @Operation(summary = "내 강의 목록 (강사 전용)")
    public ResponseEntity<List<InstructorCourseResponse>> getMyCourses(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(courseService.getMyCourses(userId));
    }

    @PostMapping
    @Operation(summary = "강의 등록 (강사 전용)")
    public ResponseEntity<InstructorCourseResponse> createCourse(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(userId, request));
    }

    @PatchMapping("/{courseId}")
    @Operation(summary = "강의 수정 (본인 강사만)")
    public ResponseEntity<InstructorCourseResponse> updateCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal Long userId,
            @RequestBody UpdateCourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(userId, courseId, request));
    }

    @DeleteMapping("/{courseId}")
    @Operation(summary = "강의 삭제 (본인 강사만)")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal Long userId) {
        courseService.deleteCourse(userId, courseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{courseId}/sections")
    @Operation(summary = "섹션 추가 (본인 강사만)")
    public ResponseEntity<SectionResponse> addSection(
            @PathVariable Long courseId,
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.addSection(userId, courseId, request));
    }
}
