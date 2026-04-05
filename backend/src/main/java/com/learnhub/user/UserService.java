package com.learnhub.user;

import com.learnhub.common.exception.DuplicateResourceException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.enrollment.Enrollment;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.user.dto.DashboardResponse;
import com.learnhub.user.dto.LoginRequest;
import com.learnhub.user.dto.SignupRequest;
import com.learnhub.user.dto.UserResponse;
import com.learnhub.user.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public UserResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("이미 사용 중인 이메일입니다: " + request.getEmail());
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .nickname(request.getNickname())
                .role("STUDENT")
                .build();
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("이메일을 찾을 수 없습니다: " + request.getEmail()));
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        return UserResponse.from(user);
    }

    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        return UserResponse.from(user);
    }

    public DashboardResponse getDashboard(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);

        int total = enrollments.size();
        int completed = (int) enrollments.stream().filter(Enrollment::isCompleted).count();
        int inProgress = total - completed;

        double overallProgress = enrollments.stream()
                .mapToDouble(e -> e.getProgressRate() != null ? e.getProgressRate().doubleValue() : 0.0)
                .average()
                .orElse(0.0);

        User user = userRepository.findById(userId).orElseThrow();

        return DashboardResponse.builder()
                .userId(userId)
                .nickname(user.getNickname())
                .totalEnrolledCourses(total)
                .completedCourses(completed)
                .inProgressCourses(inProgress)
                .overallProgressRate(Math.round(overallProgress * 100.0) / 100.0)
                .build();
    }
}
