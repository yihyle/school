package com.learnhub.lecture;

import com.learnhub.lecture.dto.LectureResponse;
import com.learnhub.progress.LectureProgressService;
import com.learnhub.progress.dto.CourseProgressResponse;
import com.learnhub.progress.dto.ProgressUpdateRequest;
import com.learnhub.progress.dto.CompleteRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lectures")
@RequiredArgsConstructor
@Tag(name = "Lectures", description = "강의 API")
public class LectureController {

    private final LectureService lectureService;
    private final LectureProgressService lectureProgressService;

    @GetMapping("/{lectureId}")
    @Operation(summary = "강의 상세 조회")
    public ResponseEntity<LectureResponse> getLecture(@PathVariable Long lectureId) {
        return ResponseEntity.ok(lectureService.getLecture(lectureId));
    }

    @PatchMapping("/{lectureId}/progress")
    @Operation(summary = "학습 진도 업데이트")
    public ResponseEntity<Void> updateProgress(
            @PathVariable Long lectureId,
            @RequestBody ProgressUpdateRequest request) {
        lectureProgressService.updateProgress(lectureId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{lectureId}/complete")
    @Operation(summary = "강의 완료 처리")
    public ResponseEntity<Void> completeLecture(
            @PathVariable Long lectureId,
            @RequestBody CompleteRequest request) {
        lectureProgressService.completeLecture(lectureId, request);
        return ResponseEntity.noContent().build();
    }
}
