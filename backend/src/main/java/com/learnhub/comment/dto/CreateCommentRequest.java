package com.learnhub.comment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCommentRequest {
    private Long userId;
    private String content;
    private Long parentId;
}
