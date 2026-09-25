package com.enterprise.merchant.controller;

import com.enterprise.merchant.entity.Merchant;
import com.enterprise.merchant.repository.MerchantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/merchants")
public class MerchantController {

    @Autowired
    private MerchantRepository merchantRepository;

    @PostMapping
    public ResponseEntity<?> createMerchant(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String settlementAccount = request.get("settlementAccount");

        if (name == null || email == null || settlementAccount == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required profile parameters."));
        }

        String merchantId = "MERCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String apiKey = "ak_test_" + UUID.randomUUID().toString().replace("-", "");

        Merchant merchant = Merchant.builder()
                .id(merchantId)
                .name(name)
                .email(email)
                .apiKey(apiKey)
                .settlementAccount(settlementAccount)
                .status("ACTIVE")
                .build();

        Merchant saved = merchantRepository.save(merchant);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMerchant(@PathVariable String id) {
        Merchant merchant = merchantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Merchant profile not found."));
        return ResponseEntity.ok(merchant);
    }

    @PostMapping("/{id}/keys")
    public ResponseEntity<?> regenerateKeys(@PathVariable String id) {
        Merchant merchant = merchantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Merchant profile not found."));

        String newKey = "ak_test_" + UUID.randomUUID().toString().replace("-", "");
        merchant.setApiKey(newKey);
        Merchant saved = merchantRepository.save(merchant);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/webhooks")
    public ResponseEntity<?> configureWebhooks(@PathVariable String id, @RequestBody Map<String, String> request) {
        Merchant merchant = merchantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Merchant profile not found."));

        String webhookUrl = request.get("webhookUrl");
        merchant.setWebhookUrl(webhookUrl);
        Merchant saved = merchantRepository.save(merchant);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateMerchant(@RequestParam String apiKey) {
        Merchant merchant = merchantRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new IllegalArgumentException("Invalid API key details. Access Denied."));
        return ResponseEntity.ok(merchant);
    }

    @GetMapping("/by-email")
    public ResponseEntity<?> getMerchantByEmail(@RequestParam String email) {
        Merchant merchant = merchantRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Merchant profile not found."));
        return ResponseEntity.ok(merchant);
    }
}
