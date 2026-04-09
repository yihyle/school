package com.learnhub.comment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user WHERE c.lecture.id = :lectureId AND c.parent IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findRootByLectureId(Long lectureId);

    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user WHERE c.parent.id IN :parentIds ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentIds(List<Long> parentIds);
}
