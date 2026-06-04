package com.learnhub.comment;

import com.learnhub.comment.dto.CommentResponse;
import com.learnhub.comment.dto.CreateCommentRequest;
import com.learnhub.comment.dto.UpdateCommentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Comments", description = "강의 댓글 / Q&A API")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/api/v1/lectures/{lectureId}/comments")
    @Operation(summary = "강의 댓글 목록 (type=GENERAL|QUESTION 으로 필터)")
    public ResponseEntity<List<CommentResponse>> list(
            @PathVariable Long lectureId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(commentService.getComments(lectureId, userId, type));
    }

    @PostMapping("/api/v1/lectures/{lectureId}/comments")
    @Operation(summary = "댓글/질문 작성")
    public ResponseEntity<CommentResponse> create(
            @PathVariable Long lectureId,
            @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(commentService.create(lectureId, request));
    }

    @PatchMapping("/api/v1/comments/{commentId}")
    @Operation(summary = "댓글 수정")
    public ResponseEntity<CommentResponse> update(
            @PathVariable Long commentId,
            @RequestBody UpdateCommentRequest request) {
        return ResponseEntity.ok(commentService.update(commentId, request));
    }

    @DeleteMapping("/api/v1/comments/{commentId}")
    @Operation(summary = "댓글 삭제 (작성자 또는 ADMIN)")
    public ResponseEntity<Void> delete(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        commentService.delete(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/v1/comments/{commentId}/like")
    @Operation(summary = "댓글 좋아요")
    public ResponseEntity<Map<String, Long>> like(
            @PathVariable Long commentId,
            @RequestBody Map<String, Long> body) {
        long count = commentService.like(commentId, body.get("userId"));
        return ResponseEntity.ok(Map.of("likeCount", count));
    }

    @DeleteMapping("/api/v1/comments/{commentId}/like")
    @Operation(summary = "댓글 좋아요 취소")
    public ResponseEntity<Map<String, Long>> unlike(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        long count = commentService.unlike(commentId, userId);
        return ResponseEntity.ok(Map.of("likeCount", count));
    }

    @PatchMapping("/api/v1/comments/{commentId}/resolve")
    @Operation(summary = "질문 해결 토글 (질문자/강사/관리자)")
    public ResponseEntity<CommentResponse> toggleResolved(
            @PathVariable Long commentId,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(commentService.toggleResolved(commentId, body.get("userId")));
    }
}
