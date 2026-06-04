package com.learnhub.admin;

import com.learnhub.admin.dto.AdminCourseResponse;
import com.learnhub.admin.dto.AdminStatsResponse;
import com.learnhub.admin.dto.AdminUserResponse;
import com.learnhub.admin.dto.UpdateActiveRequest;
import com.learnhub.admin.dto.UpdateRoleRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "관리자 전용 API (ROLE_ADMIN)")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "관리자 대시보드 통계")
    public ResponseEntity<AdminStatsResponse> stats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    @Operation(summary = "전체 사용자 목록 (keyword: 이메일/닉네임 부분일치)")
    public ResponseEntity<List<AdminUserResponse>> listUsers(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(adminService.listUsers(keyword));
    }

    @PatchMapping("/users/{userId}/role")
    @Operation(summary = "사용자 권한 변경 (STUDENT / INSTRUCTOR / ADMIN)")
    public ResponseEntity<AdminUserResponse> updateRole(
            @PathVariable Long userId,
            @RequestBody UpdateRoleRequest req) {
        return ResponseEntity.ok(adminService.updateRole(userId, req.getRole()));
    }

    @PatchMapping("/users/{userId}/active")
    @Operation(summary = "사용자 활성/비활성 변경")
    public ResponseEntity<AdminUserResponse> setActive(
            @PathVariable Long userId,
            @RequestBody UpdateActiveRequest req) {
        return ResponseEntity.ok(adminService.setActive(userId, req.getActive()));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "사용자 삭제 (자기 자신 불가)")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal Long actingAdminId) {
        adminService.deleteUser(userId, actingAdminId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses")
    @Operation(summary = "전체 강의 목록 (비공개 포함)")
    public ResponseEntity<List<AdminCourseResponse>> listCourses() {
        return ResponseEntity.ok(adminService.listCourses());
    }

    @PatchMapping("/courses/{courseId}/publish")
    @Operation(summary = "강의 공개/비공개 토글")
    public ResponseEntity<AdminCourseResponse> togglePublish(@PathVariable Long courseId) {
        return ResponseEntity.ok(adminService.togglePublish(courseId));
    }

    @DeleteMapping("/courses/{courseId}")
    @Operation(summary = "강의 삭제")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        adminService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }
}
