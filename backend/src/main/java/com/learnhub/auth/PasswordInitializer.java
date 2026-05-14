package com.learnhub.auth;

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
        userRepository.findAll().stream()
                .filter(u -> u.getPassword().startsWith("$2a$10$dummy"))
                .forEach(u -> {
                    u.setPassword(passwordEncoder.encode("password123"));
                    userRepository.save(u);
                });
    }
}
