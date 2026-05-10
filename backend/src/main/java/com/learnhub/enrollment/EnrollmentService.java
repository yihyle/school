package com.learnhub.enrollment;

import com.learnhub.common.exception.DuplicateResourceException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.enrollment.dto.EnrollmentResponse;
import com.learnhub.enrollment.dto.MyCourseResponse;
import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public EnrollmentResponse enroll(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new DuplicateResourceException("이미 수강 중인 강의입니다");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .isCompleted(false)
                .lastAccessedAt(LocalDateTime.now())
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);

        course.setEnrollmentCount(course.getEnrollmentCount() + 1);
        courseRepository.save(course);

        return EnrollmentResponse.from(saved);
    }

    public List<MyCourseResponse> getMyCourses(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return enrollmentRepository.findByUserId(userId).stream()
                .map(MyCourseResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", enrollmentId));

        Course course = enrollment.getCourse();
        if (course.getEnrollmentCount() > 0) {
            course.setEnrollmentCount(course.getEnrollmentCount() - 1);
            courseRepository.save(course);
        }

        enrollmentRepository.delete(enrollment);
    }
}
