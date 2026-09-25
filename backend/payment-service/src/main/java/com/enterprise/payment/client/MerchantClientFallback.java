package com.enterprise.payment.client;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class MerchantClientFallback implements MerchantClient {

    @Override
    public Map<String, Object> validateMerchant(String apiKey) {
        System.out.println("[RESILIENCE FALLBACK] merchant-service validateMerchant call failed. Returning fallback approved mock.");
        return Map.of("id", "MERCH-9921", "name", "Fallback Mock Merchant", "status", "ACTIVE");
    }

    @Override
    public Map<String, Object> getMerchantByEmail(String email) {
        System.out.println("[RESILIENCE FALLBACK] merchant-service getMerchantByEmail call failed. Returning fallback merchant ID.");
        return Map.of("id", "MERCH-9921", "name", "Fallback Mock Merchant", "status", "ACTIVE");
    }
}
