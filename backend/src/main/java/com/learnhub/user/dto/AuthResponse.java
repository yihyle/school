package com.learnhub.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private UserResponse user;
}
