package com.learnhub.section;

import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.lecture.Lecture;
import com.learnhub.lecture.LectureRepository;
import com.learnhub.lecture.dto.LectureResponse;
import com.learnhub.section.dto.CreateLectureRequest;
import com.learnhub.section.dto.CreateSectionRequest;
import com.learnhub.section.dto.SectionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SectionService {

    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;

    public SectionResponse addSection(Long instructorId, Long courseId, CreateSectionRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 강의에만 섹션을 추가할 수 있습니다");
        }

        List<Section> existing = sectionRepository.findByCourseIdOrderBySortOrder(courseId);
        int sortOrder = request.getSortOrder() != null ? request.getSortOrder() : existing.size() + 1;

        Section section = Section.builder()
                .course(course)
                .title(request.getTitle())
                .sortOrder(sortOrder)
                .build();

        return SectionResponse.from(sectionRepository.save(section));
    }

    public LectureResponse addLecture(Long instructorId, Long sectionId, CreateLectureRequest request) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", sectionId));

        if (!section.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 강의의 섹션에만 영상을 추가할 수 있습니다");
        }

        int lectureCount = section.getLectures() != null ? section.getLectures().size() : 0;
        int sortOrder = request.getSortOrder() != null ? request.getSortOrder() : lectureCount + 1;

        Lecture lecture = Lecture.builder()
                .section(section)
                .title(request.getTitle())
                .videoUrl(request.getVideoUrl())
                .duration(request.getDuration() != null ? request.getDuration() : 0)
                .sortOrder(sortOrder)
                .isPreview(Boolean.TRUE.equals(request.getIsPreview()))
                .build();

        return LectureResponse.from(lectureRepository.save(lecture));
    }
}
