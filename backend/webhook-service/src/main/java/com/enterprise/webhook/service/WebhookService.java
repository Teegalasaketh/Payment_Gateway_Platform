package com.enterprise.webhook.service;

import com.enterprise.webhook.entity.WebhookLog;
import java.util.List;

public interface WebhookService {
    WebhookLog createWebhookLog(WebhookLog log);
    List<WebhookLog> getAllWebhookLogs();
    WebhookLog retryWebhook(String logId);
}
