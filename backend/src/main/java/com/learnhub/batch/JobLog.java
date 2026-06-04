package com.learnhub.batch;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** 스케줄러 배치 실행 로그. job_key 유일 제약으로 동일 실행의 중복 수행을 막는다(멱등성). */
@Entity
@Table(name = "job_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_name", nullable = false, length = 100)
    private String jobName;

    @Column(name = "job_key", nullable = false, length = 150)
    private String jobKey;

    @Column(nullable = false, length = 20)
    private String status; // RUNNING / SUCCESS / FAILED

    @Column(name = "processed_count", nullable = false)
    @Builder.Default
    private Integer processedCount = 0;

    @Column(length = 500)
    private String message;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;
}
