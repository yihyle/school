package com.learnhub.enrollment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByUserId(Long userId);

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    /** 미완강 + 마지막 접속이 cutoff 이전인 수강건 (장기 미학습 리마인드 대상). */
    List<Enrollment> findByIsCompletedFalseAndLastAccessedAtBefore(LocalDateTime cutoff);
}
