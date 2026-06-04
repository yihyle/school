package com.learnhub.batch;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobLogRepository extends JpaRepository<JobLog, Long> {

    boolean existsByJobKey(String jobKey);
}
