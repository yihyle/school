package com.learnhub.comment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCommentRequest {
    private Long userId;
    private String content;
}
