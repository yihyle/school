package com.learnhub.comment;

import com.learnhub.comment.dto.CommentResponse;
import com.learnhub.comment.dto.CreateCommentRequest;
import com.learnhub.comment.dto.UpdateCommentRequest;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.lecture.Lecture;
import com.learnhub.lecture.LectureRepository;
import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final LectureRepository lectureRepository;
    private final UserRepository userRepository;

    public List<CommentResponse> getComments(Long lectureId, Long viewerId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecture", lectureId));

        List<Comment> roots = commentRepository.findRootByLectureId(lectureId);
        if (roots.isEmpty()) return Collections.emptyList();

        List<Long> rootIds = roots.stream().map(Comment::getId).collect(Collectors.toList());
        List<Comment> replies = commentRepository.findRepliesByParentIds(rootIds);

        List<Long> allIds = new ArrayList<>(rootIds);
        replies.forEach(r -> allIds.add(r.getId()));

        Map<Long, Long> likeCounts = allIds.stream()
                .collect(Collectors.toMap(id -> id, commentLikeRepository::countByCommentId));

        Set<Long> likedByViewer = viewerId == null ? Collections.emptySet()
                : commentLikeRepository.findByCommentIdInAndUserId(allIds, viewerId).stream()
                        .map(l -> l.getComment().getId())
                        .collect(Collectors.toSet());

        Map<Long, List<Comment>> repliesByParent = replies.stream()
                .collect(Collectors.groupingBy(r -> r.getParent().getId()));

        return roots.stream()
                .map(root -> toResponse(root, viewerId, likeCounts, likedByViewer,
                        repliesByParent.getOrDefault(root.getId(), Collections.emptyList())))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse create(Long lectureId, CreateCommentRequest req) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecture", lectureId));
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", req.getUserId()));

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", req.getParentId()));
            if (parent.getParent() != null) {
                throw new IllegalArgumentException("대댓글에는 답글을 달 수 없습니다.");
            }
        }

        Comment saved = commentRepository.save(Comment.builder()
                .lecture(lecture)
                .user(user)
                .parent(parent)
                .content(req.getContent())
                .build());

        return toResponse(saved, req.getUserId(), Map.of(saved.getId(), 0L),
                Collections.emptySet(), Collections.emptyList());
    }

    @Transactional
    public CommentResponse update(Long commentId, UpdateCommentRequest req) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getUser().getId().equals(req.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 수정할 수 있습니다.");
        }
        comment.setContent(req.getContent());
        commentRepository.save(comment);

        long likeCount = commentLikeRepository.countByCommentId(commentId);
        boolean liked = commentLikeRepository.findByCommentIdAndUserId(commentId, req.getUserId()).isPresent();
        return toResponse(comment, req.getUserId(),
                Map.of(commentId, likeCount),
                liked ? Set.of(commentId) : Collections.emptySet(),
                Collections.emptyList());
    }

    @Transactional
    public void delete(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제할 수 있습니다.");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public long like(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (commentLikeRepository.findByCommentIdAndUserId(commentId, userId).isEmpty()) {
            commentLikeRepository.save(CommentLike.builder().comment(comment).user(user).build());
        }
        return commentLikeRepository.countByCommentId(commentId);
    }

    @Transactional
    public long unlike(Long commentId, Long userId) {
        commentLikeRepository.findByCommentIdAndUserId(commentId, userId)
                .ifPresent(commentLikeRepository::delete);
        return commentLikeRepository.countByCommentId(commentId);
    }

    private CommentResponse toResponse(Comment c, Long viewerId,
                                       Map<Long, Long> likeCounts,
                                       Set<Long> likedByViewer,
                                       List<Comment> replies) {
        List<CommentResponse> replyDtos = replies.stream()
                .map(r -> toResponse(r, viewerId, likeCounts, likedByViewer, Collections.emptyList()))
                .collect(Collectors.toList());

        return CommentResponse.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .userNickname(c.getUser().getNickname())
                .userProfileImage(c.getUser().getProfileImage())
                .content(c.getContent())
                .likeCount(likeCounts.getOrDefault(c.getId(), 0L))
                .likedByMe(likedByViewer.contains(c.getId()))
                .editable(viewerId != null && viewerId.equals(c.getUser().getId()))
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .replies(replyDtos)
                .build();
    }
}
