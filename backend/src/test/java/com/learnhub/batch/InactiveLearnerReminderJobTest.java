package com.learnhub.batch;

import com.learnhub.course.Course;
import com.learnhub.enrollment.Enrollment;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.notification.NotificationService;
import com.learnhub.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 장기 미학습 리마인드 배치 단위 테스트.
 * job_key 로 하루 1회 실행 보장(멱등성)과, 대상 수강건에 대한 알림 적재를 검증한다.
 * (F-P3-04)
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InactiveLearnerReminderJobTest {

    @Mock EnrollmentRepository enrollmentRepository;
    @Mock NotificationService notificationService;
    @Mock JobLogRepository jobLogRepository;

    @InjectMocks InactiveLearnerReminderJob job;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(job, "inactiveDays", 7);
    }

    @Test
    @DisplayName("오늘 이미 실행된 잡은 건너뛴다(멱등성)")
    void skipWhenAlreadyRun() {
        when(jobLogRepository.existsByJobKey(anyString())).thenReturn(true);

        job.run();

        verify(enrollmentRepository, never()).findByIsCompletedFalseAndLastAccessedAtBefore(any());
        verify(jobLogRepository, never()).save(any());
        verify(notificationService, never()).enqueue(any(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("미학습 대상마다 리마인드 알림을 적재하고 잡을 SUCCESS 로 기록")
    void enqueueForInactiveLearners() {
        List<Enrollment> targets = List.of(inactiveEnrollment(11L), inactiveEnrollment(12L));
        when(jobLogRepository.existsByJobKey(anyString())).thenReturn(false);
        when(jobLogRepository.save(any(JobLog.class))).thenAnswer(inv -> inv.getArgument(0));
        when(enrollmentRepository.findByIsCompletedFalseAndLastAccessedAtBefore(any()))
                .thenReturn(targets);
        when(notificationService.enqueue(any(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(true);

        job.run();

        verify(notificationService, times(2))
                .enqueue(any(), anyString(), anyString(), anyString(), anyString());

        ArgumentCaptor<JobLog> captor = ArgumentCaptor.forClass(JobLog.class);
        verify(jobLogRepository, atLeast(2)).save(captor.capture());
        JobLog last = captor.getAllValues().get(captor.getAllValues().size() - 1);
        assertThat(last.getStatus()).isEqualTo("SUCCESS");
        assertThat(last.getProcessedCount()).isEqualTo(2);
    }

    private Enrollment inactiveEnrollment(long id) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        Course course = mock(Course.class);
        when(course.getTitle()).thenReturn("스프링 부트 입문");

        Enrollment e = mock(Enrollment.class);
        when(e.getId()).thenReturn(id);
        when(e.getUser()).thenReturn(user);
        when(e.getCourse()).thenReturn(course);
        return e;
    }
}
