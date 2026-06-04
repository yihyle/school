package com.learnhub.lecture;

import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.lecture.dto.LectureResponse;
import com.learnhub.progress.LectureProgress;
import com.learnhub.progress.LectureProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LectureService {

    private final LectureRepository lectureRepository;
    private final LectureProgressRepository lectureProgressRepository;

    public LectureResponse getLecture(Long lectureId, Long userId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecture", lectureId));
        LectureProgress progress = userId != null
                ? lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId).orElse(null)
                : null;
        return LectureResponse.from(lecture, progress);
    }
}
