package com.learnhub.p3;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 관측성·보안 통합 테스트(@SpringBootTest).
 * 헬스체크는 무인증 공개(F-P3-11), 그 외 actuator 엔드포인트는 인증 필요(보안 요구사항)를 검증한다.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ActuatorSecurityIntegrationTest {

    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("헬스체크는 무인증으로 200 을 반환한다")
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("metrics 등 그 외 actuator 는 무인증 접근을 거부한다")
    void otherActuatorRequiresAuth() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().is4xxClientError());
    }
}
