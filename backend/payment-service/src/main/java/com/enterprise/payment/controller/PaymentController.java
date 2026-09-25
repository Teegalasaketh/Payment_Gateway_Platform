package com.enterprise.payment.controller;

import com.enterprise.payment.dto.CheckoutRequest;
import com.enterprise.payment.entity.Payment;
import com.enterprise.payment.service.IdempotencyService;
import com.enterprise.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private IdempotencyService idempotencyService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody CheckoutRequest request) {
        
        String requestString = request.toString();
        String requestHash = generateSha256(requestString);

        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            if (idempotencyService.isDuplicate(idempotencyKey, requestHash)) {
                System.out.println("[IDEMPOTENCY BLOCK] Duplicate payment key rejected: " + idempotencyKey);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Idempotency collision! Duplicate request blocked.", 
                                     "code", "CONFLICT"));
            }
            idempotencyService.registerKey(idempotencyKey, requestHash);
        }

        try {
            Payment payment = paymentService.createPayment(request);
            return ResponseEntity.ok(payment);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable String id) {
        try {
            Payment payment = paymentService.refundPayment(id);
            return ResponseEntity.ok(payment);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<?> retryPayment(@PathVariable String id) {
        try {
            Payment payment = paymentService.retryPayment(id);
            return ResponseEntity.ok(payment);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    private String generateSha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception ex) {
            return "hash-failed-" + text.hashCode();
        }
    }
}
