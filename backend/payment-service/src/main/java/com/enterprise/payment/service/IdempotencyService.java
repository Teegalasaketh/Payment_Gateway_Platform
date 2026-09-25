package com.enterprise.payment.service;

public interface IdempotencyService {
    boolean isDuplicate(String key, String requestHash);
    void registerKey(String key, String requestHash);
}
