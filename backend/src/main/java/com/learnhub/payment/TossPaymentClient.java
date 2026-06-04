package com.learnhub.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * 토스페이먼츠 결제 승인 클라이언트.
 * Basic 인증: base64(secretKey + ":") — 시크릿 키 뒤에 콜론, 비밀번호는 빈 값.
 * provider=TOSS 일 때만 호출된다.
 */
@Component
public class TossPaymentClient {

    private static final Logger log = LoggerFactory.getLogger(TossPaymentClient.class);

    private final String secretKey;
    private final String confirmUrl;
    private final RestClient restClient;

    public TossPaymentClient(
            @Value("${payment.toss.secret-key:test_sk_dummy}") String secretKey,
            @Value("${payment.toss.confirm-url:https://api.tosspayments.com/v1/payments/confirm}") String confirmUrl) {
        this.secretKey = secretKey;
        this.confirmUrl = confirmUrl;
        this.restClient = RestClient.builder().build();
    }

    /** 토스 결제 승인. 실패 시 400 으로 변환해 던진다. */
    public void confirm(String paymentKey, String orderId, Integer amount) {
        if (paymentKey == null || paymentKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paymentKey가 필요합니다");
        }
        String basic = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        try {
            restClient.post()
                    .uri(confirmUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + basic)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("paymentKey", paymentKey, "orderId", orderId, "amount", amount))
                    .retrieve()
                    .toBodilessEntity();
            log.info("[Toss] 승인 성공 orderId={}", orderId);
        } catch (Exception e) {
            log.warn("[Toss] 승인 실패 orderId={} err={}", orderId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 승인에 실패했습니다: " + e.getMessage());
        }
    }
}
