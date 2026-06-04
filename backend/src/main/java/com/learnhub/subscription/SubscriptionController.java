package com.learnhub.subscription;

import com.learnhub.subscription.dto.SubscriptionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "강의 알림 구독 API")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    @Operation(summary = "내 구독 목록")
    public ResponseEntity<List<SubscriptionResponse>> mySubscriptions(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(subscriptionService.mySubscriptions(userId));
    }

    @GetMapping("/courses/{courseId}")
    @Operation(summary = "특정 강의 구독 여부")
    public ResponseEntity<Map<String, Boolean>> isSubscribed(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(Map.of("subscribed", subscriptionService.isSubscribed(userId, courseId)));
    }

    @PostMapping("/courses/{courseId}")
    @Operation(summary = "강의 알림 구독")
    public ResponseEntity<SubscriptionResponse> subscribe(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(subscriptionService.subscribe(userId, courseId));
    }

    @DeleteMapping("/courses/{courseId}")
    @Operation(summary = "강의 알림 구독 취소")
    public ResponseEntity<Void> unsubscribe(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long courseId) {
        subscriptionService.unsubscribe(userId, courseId);
        return ResponseEntity.noContent().build();
    }
}
