package com.learnhub.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LectureProgressRepository extends JpaRepository<LectureProgress, Long> {

    Optional<LectureProgress> findByUserIdAndLectureId(Long userId, Long lectureId);

    @Query("SELECT lp FROM LectureProgress lp WHERE lp.user.id = :userId " +
           "AND lp.lecture.id IN (SELECT l.id FROM Lecture l WHERE l.section.course.id = :courseId)")
    List<LectureProgress> findByUserIdAndCourseId(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId);
}
