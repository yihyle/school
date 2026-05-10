package com.learnhub.enrollment;

import com.learnhub.enrollment.dto.EnrollmentRequest;
import com.learnhub.enrollment.dto.EnrollmentResponse;
import com.learnhub.enrollment.dto.MyCourseResponse;
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
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollments", description = "수강 신청 API")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    @Operation(summary = "수강 신청")
    public ResponseEntity<EnrollmentResponse> enroll(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody EnrollmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.enroll(userId, request.getCourseId()));
    }

    @GetMapping("/my-courses")
    @Operation(summary = "내 수강 목록 조회")
    public ResponseEntity<List<MyCourseResponse>> getMyCourses(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(enrollmentService.getMyCourses(userId));
    }

    @DeleteMapping("/{enrollmentId}")
    @Operation(summary = "수강 취소")
    public ResponseEntity<Void> cancelEnrollment(@PathVariable Long enrollmentId) {
        enrollmentService.cancelEnrollment(enrollmentId);
        return ResponseEntity.noContent().build();
    }
}
