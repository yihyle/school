package com.learnhub.enrollment;

import com.learnhub.common.exception.DuplicateResourceException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.enrollment.dto.EnrollmentRequest;
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
    public EnrollmentResponse enroll(EnrollmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", request.getCourseId()));

        if (enrollmentRepository.existsByUserIdAndCourseId(request.getUserId(), request.getCourseId())) {
            throw new DuplicateResourceException("Already enrolled in this course");
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
