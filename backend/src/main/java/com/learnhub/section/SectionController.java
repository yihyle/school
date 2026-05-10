package com.learnhub.section;

import com.learnhub.lecture.dto.LectureResponse;
import com.learnhub.section.dto.CreateLectureRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sections")
@RequiredArgsConstructor
@Tag(name = "Sections", description = "섹션 관리 API")
public class SectionController {

    private final SectionService sectionService;

    @PostMapping("/{sectionId}/lectures")
    @Operation(summary = "강의 영상 추가 (강사 전용)")
    public ResponseEntity<LectureResponse> addLecture(
            @PathVariable Long sectionId,
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CreateLectureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.addLecture(userId, sectionId, request));
    }
}
