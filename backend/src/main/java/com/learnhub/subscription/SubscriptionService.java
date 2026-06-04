package com.learnhub.subscription;

import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CourseRepository courseRepository;

    /** 강의 알림 구독 (이미 구독 중이면 그대로 반환 — 멱등). */
    @Transactional
    public SubscriptionResponse subscribe(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));

        Subscription sub = subscriptionRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> subscriptionRepository.save(Subscription.builder()
                        .userId(userId)
                        .courseId(course.getId())
                        .channel("DISCORD")
                        .build()));
        return SubscriptionResponse.from(sub);
    }

    @Transactional
    public void unsubscribe(Long userId, Long courseId) {
        subscriptionRepository.findByUserIdAndCourseId(userId, courseId)
                .ifPresent(subscriptionRepository::delete);
    }

    public List<SubscriptionResponse> mySubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId).stream()
                .map(SubscriptionResponse::from)
                .collect(Collectors.toList());
    }

    public boolean isSubscribed(Long userId, Long courseId) {
        return subscriptionRepository.existsByUserIdAndCourseId(userId, courseId);
    }
}
