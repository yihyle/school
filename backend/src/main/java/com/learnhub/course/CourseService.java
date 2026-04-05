package com.learnhub.course;

import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.dto.CourseDetailResponse;
import com.learnhub.course.dto.CourseListResponse;
import com.learnhub.progress.LectureProgressService;
import com.learnhub.progress.dto.CourseProgressResponse;
import com.learnhub.section.Section;
import com.learnhub.section.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final LectureProgressService lectureProgressService;

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
}
