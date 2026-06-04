package com.learnhub.auth;

import com.learnhub.user.User;
import com.learnhub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PasswordInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        userRepository.findAll().forEach(u -> {
            if (u.getPassword() == null) return;

            if ("admin@learnhub.io".equals(u.getEmail())
                    && u.getPassword().startsWith("$2a$10$dummy_admin")) {
                u.setPassword(passwordEncoder.encode("admin1234"));
                userRepository.save(u);
                return;
            }

            if (u.getPassword().startsWith("$2a$10$dummy")) {
                u.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(u);
            }
        });
    }
}
