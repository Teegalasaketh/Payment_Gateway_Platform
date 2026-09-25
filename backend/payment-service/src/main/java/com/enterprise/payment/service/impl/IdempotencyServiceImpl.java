package com.enterprise.payment.service.impl;

import com.enterprise.payment.entity.IdempotencyKey;
import com.enterprise.payment.repository.IdempotencyKeyRepository;
import com.enterprise.payment.service.IdempotencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class IdempotencyServiceImpl implements IdempotencyService {

    @Autowired
    private IdempotencyKeyRepository keyRepository;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private static final String REDIS_PREFIX = "idem:";

    @Override
    public boolean isDuplicate(String key, String requestHash) {
        if (key == null || key.trim().isEmpty()) {
            return false;
        }

        try {
            if (redisTemplate != null) {
                String existingHash = redisTemplate.opsForValue().get(REDIS_PREFIX + key);
                if (existingHash != null) {
                    return true;
                }
            }
        } catch (Exception ex) {
            // Fallback
        }

        return keyRepository.findById(key)
                .map(k -> k.getRequestHash().equals(requestHash))
                .orElse(false);
    }

    @Override
    public void registerKey(String key, String requestHash) {
        if (key == null || key.trim().isEmpty()) {
            return;
        }

        IdempotencyKey idemKey = IdempotencyKey.builder()
                .key(key)
                .requestHash(requestHash)
                .status("Stored")
                .createdAt(LocalDateTime.now())
                .build();
        keyRepository.save(idemKey);

        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(REDIS_PREFIX + key, requestHash, Duration.ofHours(24));
            }
        } catch (Exception ex) {
            // Fallback safely
        }
    }
}
