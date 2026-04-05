package com.learnhub.user;

import com.learnhub.user.dto.DashboardResponse;
import com.learnhub.user.dto.UserResponse;
import com.learnhub.user.dto.UserUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "사용자 API")
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    @Operation(summary = "사용자 정보 조회")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @PatchMapping("/{userId}")
    @Operation(summary = "사용자 정보 수정")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @GetMapping("/{userId}/dashboard")
    @Operation(summary = "학습 대시보드 조회")
    public ResponseEntity<DashboardResponse> getDashboard(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getDashboard(userId));
    }
}
