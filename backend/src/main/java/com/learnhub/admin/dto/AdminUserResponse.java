package com.learnhub.admin.dto;

import com.learnhub.user.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static AdminUserResponse from(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .nickname(u.getNickname())
                .role(u.getRole())
                .isActive(u.getIsActive() == null ? Boolean.TRUE : u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
