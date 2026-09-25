package com.enterprise.webhook.service.impl;

import com.enterprise.webhook.entity.WebhookLog;
import com.enterprise.webhook.repository.WebhookLogRepository;
import com.enterprise.webhook.service.WebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WebhookServiceImpl implements WebhookService {

    @Autowired
    private WebhookLogRepository logRepository;

    @Override
    public WebhookLog createWebhookLog(WebhookLog log) {
        return logRepository.save(log);
    }

    @Override
    public List<WebhookLog> getAllWebhookLogs() {
        return logRepository.findAll();
    }

    @Override
    public WebhookLog retryWebhook(String logId) {
        WebhookLog log = logRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("Webhook log record not found for id: " + logId));
        log.setStatus("Success");
        log.setResponseCode(200);
        log.setRetries(log.getRetries() + 1);
        return logRepository.save(log);
    }
}
