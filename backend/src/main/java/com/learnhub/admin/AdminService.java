package com.learnhub.admin;

import com.learnhub.admin.dto.AdminCourseResponse;
import com.learnhub.admin.dto.AdminStatsResponse;
import com.learnhub.admin.dto.AdminUserResponse;
import com.learnhub.comment.CommentRepository;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.Course;
import com.learnhub.course.CourseRepository;
import com.learnhub.enrollment.EnrollmentRepository;
import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private static final Set<String> VALID_ROLES = Set.of("STUDENT", "INSTRUCTOR", "ADMIN");

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CommentRepository commentRepository;

    public AdminStatsResponse getStats() {
        List<User> users = userRepository.findAll();
        List<Course> courses = courseRepository.findAll();

        long totalStudents = users.stream().filter(u -> "STUDENT".equals(u.getRole())).count();
        long totalInstructors = users.stream().filter(u -> "INSTRUCTOR".equals(u.getRole())).count();
        long publishedCourses = courses.stream().filter(c -> Boolean.TRUE.equals(c.getIsPublished())).count();

        Map<String, Long> usersByRole = users.stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole() == null ? "UNKNOWN" : u.getRole(),
                        TreeMap::new, Collectors.counting()));

        Map<String, Long> coursesByCategory = courses.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCategory() == null ? "UNKNOWN" : c.getCategory(),
                        TreeMap::new, Collectors.counting()));

        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        List<AdminStatsResponse.RecentUser> recent = users.stream()
                .sorted(Comparator.comparing(User::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .map(u -> AdminStatsResponse.RecentUser.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .nickname(u.getNickname())
                        .role(u.getRole())
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().format(fmt) : null)
                        .build())
                .collect(Collectors.toList());

        List<AdminStatsResponse.TopCourse> top = courses.stream()
                .sorted(Comparator.comparingInt(
                        (Course c) -> c.getEnrollmentCount() == null ? 0 : c.getEnrollmentCount()).reversed())
                .limit(5)
                .map(c -> AdminStatsResponse.TopCourse.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .instructorNickname(c.getInstructor() != null ? c.getInstructor().getNickname() : null)
                        .enrollmentCount(c.getEnrollmentCount())
                        .build())
                .collect(Collectors.toList());

        long totalComments = commentRepository.count();
        long totalQuestions = commentRepository.findAll().stream()
                .filter(c -> "QUESTION".equals(c.getType()) && c.getParent() == null)
                .count();
        long unresolvedQuestions = commentRepository.findAll().stream()
                .filter(c -> "QUESTION".equals(c.getType()) && c.getParent() == null && !Boolean.TRUE.equals(c.getResolved()))
                .count();

        return AdminStatsResponse.builder()
                .totalUsers(users.size())
                .totalStudents(totalStudents)
                .totalInstructors(totalInstructors)
                .totalCourses(courses.size())
                .publishedCourses(publishedCourses)
                .totalEnrollments(enrollmentRepository.count())
                .totalComments(totalComments)
                .totalQuestions(totalQuestions)
                .unresolvedQuestions(unresolvedQuestions)
                .usersByRole(usersByRole)
                .coursesByCategory(coursesByCategory)
                .recentUsers(recent)
                .topCourses(top)
                .build();
    }

    public List<AdminUserResponse> listUsers(String keyword) {
        return userRepository.findAll().stream()
                .filter(u -> keyword == null || keyword.isBlank()
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(keyword.toLowerCase()))
                        || (u.getNickname() != null && u.getNickname().toLowerCase().contains(keyword.toLowerCase())))
                .sorted(Comparator.comparing(User::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse updateRole(Long userId, String role) {
        if (role == null || !VALID_ROLES.contains(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "유효한 role 값: " + VALID_ROLES);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setRole(role);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse setActive(Long userId, Boolean active) {
        if (active == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "active 값이 필요합니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setIsActive(active);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId, Long actingAdminId) {
        if (userId.equals(actingAdminId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자기 자신은 삭제할 수 없습니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        userRepository.delete(user);
    }

    public List<AdminCourseResponse> listCourses() {
        return courseRepository.findAll().stream()
                .sorted(Comparator.comparing(Course::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(AdminCourseResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminCourseResponse togglePublish(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        course.setIsPublished(!Boolean.TRUE.equals(course.getIsPublished()));
        return AdminCourseResponse.from(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        courseRepository.delete(course);
    }
}
