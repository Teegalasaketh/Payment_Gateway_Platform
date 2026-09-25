package com.enterprise.webhook.controller;

import com.enterprise.webhook.entity.WebhookLog;
import com.enterprise.webhook.service.WebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @Autowired
    private WebhookService webhookService;

    @GetMapping("/logs")
    public ResponseEntity<List<WebhookLog>> getAllLogs() {
        return ResponseEntity.ok(webhookService.getAllWebhookLogs());
    }

    @PostMapping("/logs/{id}/retry")
    public ResponseEntity<?> retryWebhook(@PathVariable String id) {
        try {
            WebhookLog log = webhookService.retryWebhook(id);
            return ResponseEntity.ok(log);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
