package com.learnhub.lecture;

import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.lecture.dto.LectureResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LectureService {

    private final LectureRepository lectureRepository;

    public LectureResponse getLecture(Long lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecture", lectureId));
        return LectureResponse.from(lecture);
    }
}
