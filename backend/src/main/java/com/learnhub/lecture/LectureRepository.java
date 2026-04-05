package com.learnhub.lecture;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    @Query("SELECT l FROM Lecture l WHERE l.section.course.id = :courseId")
    List<Lecture> findByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT l FROM Lecture l WHERE l.section.id IN (SELECT s.id FROM Section s WHERE s.course.id = :courseId)")
    List<Lecture> findAllByCourseId(@Param("courseId") Long courseId);
}
