package com.learnhub.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * 디스코드 Webhook 발송 클라이언트.
 * - webhook-url 이 비어 있으면(로컬 기본값) 실제 전송 없이 로그만 남긴다 → 개발 환경 안전.
 * - 429(레이트리밋)/5xx 는 예외로 던져 호출측(NotificationService)이 재시도하도록 한다.
 */
@Component
public class DiscordWebhookClient {

    private static final Logger log = LoggerFactory.getLogger(DiscordWebhookClient.class);

    private final String webhookUrl;
    private final String username;
    private final RestClient restClient;

    public DiscordWebhookClient(
            @Value("${discord.webhook-url:}") String webhookUrl,
            @Value("${discord.username:LearnHub Bot}") String username) {
        this.webhookUrl = webhookUrl;
        this.username = username;
        this.restClient = RestClient.builder().build();
    }

    public boolean isEnabled() {
        return webhookUrl != null && !webhookUrl.isBlank();
    }

    /**
     * 디스코드 채널로 메시지를 전송한다.
     * @throws org.springframework.web.client.RestClientException 전송 실패(재시도 유도)
     */
    public void send(String title, String message) {
        if (!isEnabled()) {
            log.info("[Discord] webhook 미설정 → 발송 생략 (title={})", title);
            return;
        }
        String content = "**" + title + "**\n" + message;
        restClient.post()
                .uri(webhookUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("username", username, "content", truncate(content)))
                .retrieve()
                .toBodilessEntity();
        log.debug("[Discord] 발송 성공 (title={})", title);
    }

    /** 디스코드 content 최대 2000자 제한 대응. */
    private String truncate(String s) {
        return s.length() <= 2000 ? s : s.substring(0, 1997) + "...";
    }
}
