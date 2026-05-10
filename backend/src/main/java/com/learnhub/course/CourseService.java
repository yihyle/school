package com.learnhub.course;

import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.dto.CourseDetailResponse;
import com.learnhub.course.dto.CourseListResponse;
import com.learnhub.course.dto.CreateCourseRequest;
import com.learnhub.course.dto.InstructorCourseResponse;
import com.learnhub.course.dto.UpdateCourseRequest;
import com.learnhub.progress.LectureProgressService;
import com.learnhub.progress.dto.CourseProgressResponse;
import com.learnhub.section.Section;
import com.learnhub.section.SectionRepository;
import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final LectureProgressService lectureProgressService;
    private final UserRepository userRepository;

    public List<CourseListResponse> getCourses(String category, String keyword) {
        return courseRepository.findAllPublishedWithFilters(category, keyword).stream()
                .map(CourseListResponse::from)
                .collect(Collectors.toList());
    }

    public List<CourseListResponse> getTrendingCourses() {
        return courseRepository.findTopByEnrollmentCount().stream()
                .limit(10)
                .map(CourseListResponse::from)
                .collect(Collectors.toList());
    }

    public CourseDetailResponse getCourseDetail(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        List<Section> sections = sectionRepository.findByCourseIdOrderBySortOrder(courseId);
        return CourseDetailResponse.from(course, sections);
    }

    public CourseProgressResponse getCourseProgress(Long courseId, Long userId) {
        return lectureProgressService.getCourseProgress(courseId, userId);
    }

    // ── 강사 전용 ──────────────────────────────────────────────────────────────

    @Transactional
    public InstructorCourseResponse createCourse(Long instructorId, CreateCourseRequest request) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", instructorId));

        if (!"INSTRUCTOR".equals(instructor.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "강사만 강의를 등록할 수 있습니다");
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .category(request.getCategory())
                .level(request.getLevel())
                .price(request.getPrice() != null ? request.getPrice() : 0)
                .isPublished(Boolean.TRUE.equals(request.getIsPublished()))
                .instructor(instructor)
                .build();

        return InstructorCourseResponse.from(courseRepository.save(course));
    }

    @Transactional
    public InstructorCourseResponse updateCourse(Long instructorId, Long courseId, UpdateCourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 강의만 수정할 수 있습니다");
        }

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getThumbnailUrl() != null) course.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getCategory() != null) course.setCategory(request.getCategory());
        if (request.getLevel() != null) course.setLevel(request.getLevel());
        if (request.getPrice() != null) course.setPrice(request.getPrice());
        if (request.getIsPublished() != null) course.setIsPublished(request.getIsPublished());

        return InstructorCourseResponse.from(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long instructorId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 강의만 삭제할 수 있습니다");
        }

        courseRepository.delete(course);
    }

    public List<InstructorCourseResponse> getMyCourses(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId).stream()
                .map(InstructorCourseResponse::from)
                .collect(Collectors.toList());
    }
}
