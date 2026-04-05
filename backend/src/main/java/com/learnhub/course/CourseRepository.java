package com.learnhub.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c WHERE c.isPublished = true " +
           "AND (:category IS NULL OR c.category = :category) " +
           "AND (:keyword IS NULL OR c.title LIKE %:keyword% OR c.description LIKE %:keyword%)")
    List<Course> findAllPublishedWithFilters(
            @Param("category") String category,
            @Param("keyword") String keyword);

    @Query("SELECT c FROM Course c WHERE c.isPublished = true ORDER BY c.enrollmentCount DESC")
    List<Course> findTopByEnrollmentCount();
}
