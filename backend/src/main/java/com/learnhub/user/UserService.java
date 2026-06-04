package com.learnhub.user;

import com.learnhub.auth.JwtTokenProvider;
import com.learnhub.common.exception.DuplicateResourceException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.enrollment.Enrollment;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.notification.NotificationService;
import com.learnhub.notification.NotificationType;
import com.learnhub.user.dto.AuthResponse;
import com.learnhub.user.dto.DashboardResponse;
import com.learnhub.user.dto.LoginRequest;
import com.learnhub.user.dto.SignupRequest;
import com.learnhub.user.dto.UserResponse;
import com.learnhub.user.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final NotificationService notificationService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("이미 사용 중인 이메일입니다: " + request.getEmail());
        }
        String role = (request.getRole() != null && request.getRole().equals("INSTRUCTOR"))
                ? "INSTRUCTOR" : "STUDENT";
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(role)
                .build();
        User saved = userRepository.save(user);

        // 운영자 알림: 신규 가입 (특히 강사 가입 모니터링)
        notificationService.enqueue(null, NotificationType.OPS_ALERT, "🙋 신규 회원 가입",
                String.format("%s (%s) 님이 %s 로 가입했습니다.",
                        saved.getNickname(), saved.getEmail(), saved.getRole()),
                "signup:" + saved.getId());

        String token = jwtTokenProvider.createToken(saved.getId(), saved.getRole());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(UserResponse.from(saved))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다");
        }
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비활성화된 계정입니다. 관리자에게 문의하세요.");
        }
        String token = jwtTokenProvider.createToken(user.getId(), user.getRole());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(UserResponse.from(user))
                .build();
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        int total = enrollments.size();
        int completed = (int) enrollments.stream().filter(Enrollment::isCompleted).count();
        double overallProgress = enrollments.stream()
                .mapToDouble(e -> e.getProgressRate() != null ? e.getProgressRate().doubleValue() : 0.0)
                .average()
                .orElse(0.0);
        return DashboardResponse.builder()
                .userId(userId)
                .nickname(user.getNickname())
                .totalEnrolledCourses(total)
                .completedCourses(completed)
                .inProgressCourses(total - completed)
                .overallProgressRate(Math.round(overallProgress * 100.0) / 100.0)
                .build();
    }
}
