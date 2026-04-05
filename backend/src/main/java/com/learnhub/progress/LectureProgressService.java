package com.learnhub.progress;

import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.enrollment.Enrollment;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.lecture.Lecture;
import com.learnhub.lecture.LectureRepository;
import com.learnhub.progress.dto.CompleteRequest;
import com.learnhub.progress.dto.CourseProgressResponse;
import com.learnhub.progress.dto.LectureProgressResponse;
import com.learnhub.progress.dto.ProgressUpdateRequest;
import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LectureProgressService {

    private final LectureProgressRepository lectureProgressRepository;
    private final LectureRepository lectureRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public void updateProgress(Long lectureId, ProgressUpdateRequest request) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecture", lectureId));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        LectureProgress progress = lectureProgressRepository
                .findByUserIdAndLectureId(request.getUserId(), lectureId)
                .orElseGet(() -> LectureProgress.builder()
                        .user(user)
                        .lecture(lecture)
                        .isCompleted(false)
                        .build());

        progress.setLastPosition(request.getLastPosition());
        lectureProgressRepository.save(progress);

        updateEnrollmentLastAccessed(request.getUserId(), lecture);
    }

    @Transactional
    public void completeLecture(Long lectureId, CompleteRequest request) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecture", lectureId));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        LectureProgress progress = lectureProgressRepository
                .findByUserIdAndLectureId(request.getUserId(), lectureId)
                .orElseGet(() -> LectureProgress.builder()
                        .user(user)
                        .lecture(lecture)
                        .build());

        if (!progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lectureProgressRepository.save(progress);

            recalculateCourseProgress(request.getUserId(), lecture.getSection().getCourse().getId());
        }
    }

    public CourseProgressResponse getCourseProgress(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<Lecture> allLectures = lectureRepository.findAllByCourseId(courseId);
        List<LectureProgress> progresses = lectureProgressRepository.findByUserIdAndCourseId(userId, courseId);

        Map<Long, LectureProgress> progressMap = progresses.stream()
                .collect(Collectors.toMap(p -> p.getLecture().getId(), p -> p));

        int total = allLectures.size();
        int completed = (int) progresses.stream().filter(LectureProgress::isCompleted).count();
        double rate = total == 0 ? 0.0 : Math.round((double) completed / total * 10000.0) / 100.0;

        List<LectureProgressResponse> lectureProgressResponses = allLectures.stream()
                .map(lecture -> {
                    LectureProgress lp = progressMap.get(lecture.getId());
                    if (lp != null) {
                        return LectureProgressResponse.from(lp);
                    }
                    return LectureProgressResponse.builder()
                            .lectureId(lecture.getId())
                            .lectureTitle(lecture.getTitle())
                            .lastPosition(0)
                            .isCompleted(false)
                            .completedAt(null)
                            .updatedAt(null)
                            .build();
                })
                .collect(Collectors.toList());

        return CourseProgressResponse.builder()
                .courseId(courseId)
                .courseTitle(course.getTitle())
                .totalLectures(total)
                .completedLectures(completed)
                .progressRate(rate)
                .lectureProgresses(lectureProgressResponses)
                .build();
    }

    private void recalculateCourseProgress(Long userId, Long courseId) {
        List<Lecture> allLectures = lectureRepository.findAllByCourseId(courseId);
        List<LectureProgress> progresses = lectureProgressRepository.findByUserIdAndCourseId(userId, courseId);

        int total = allLectures.size();
        int completed = (int) progresses.stream().filter(LectureProgress::isCompleted).count();

        if (total == 0) return;

        BigDecimal rate = BigDecimal.valueOf((double) completed / total * 100)
                .setScale(2, RoundingMode.HALF_UP);

        enrollmentRepository.findByUserIdAndCourseId(userId, courseId).ifPresent(enrollment -> {
            enrollment.setProgressRate(rate);
            enrollment.setCompleted(completed == total);
            enrollment.setLastAccessedAt(LocalDateTime.now());
            enrollmentRepository.save(enrollment);
        });
    }

    private void updateEnrollmentLastAccessed(Long userId, Lecture lecture) {
        Long courseId = lecture.getSection().getCourse().getId();
        enrollmentRepository.findByUserIdAndCourseId(userId, courseId).ifPresent(enrollment -> {
            enrollment.setLastAccessedAt(LocalDateTime.now());
            enrollmentRepository.save(enrollment);
        });
    }
}
