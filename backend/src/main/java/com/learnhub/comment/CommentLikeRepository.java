package com.learnhub.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

    Optional<CommentLike> findByCommentIdAndUserId(Long commentId, Long userId);

    long countByCommentId(Long commentId);

    List<CommentLike> findByCommentIdIn(List<Long> commentIds);

    List<CommentLike> findByCommentIdInAndUserId(List<Long> commentIds, Long userId);
}
