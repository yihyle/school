package com.learnhub.common;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * 요청 추적 로그 필터(관측성).
 * 요청마다 traceId 를 MDC 에 넣어 모든 로그에 상관관계 ID 가 붙도록 하고,
 * 메서드/경로/상태/소요시간을 한 줄로 남긴다.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("http.access");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("traceId", traceId);
        response.setHeader("X-Trace-Id", traceId);
        long start = System.currentTimeMillis();
        try {
            chain.doFilter(request, response);
        } finally {
            long took = System.currentTimeMillis() - start;
            String uri = request.getRequestURI();
            // actuator 헬스체크 등 노이즈는 제외
            if (!uri.startsWith("/actuator")) {
                log.info("{} {} -> {} ({}ms)", request.getMethod(), uri, response.getStatus(), took);
            }
            MDC.clear();
        }
    }
}
