package com.enterprise.webhook.kafka.consumer;

import com.enterprise.webhook.client.MerchantClient;
import com.enterprise.webhook.client.PaymentClient;
import com.enterprise.webhook.entity.WebhookLog;
import com.enterprise.webhook.repository.WebhookLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
public class PaymentEventConsumer {

    @Autowired
    private WebhookLogRepository logRepository;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private MerchantClient merchantClient;

    private static final String TOPIC_COMPLETED = "payment-events-completed";

    @KafkaListener(topics = TOPIC_COMPLETED, groupId = "webhook-group")
    public void consumePaymentCompleted(Map<String, Object> message) {
        System.out.println("[KAFKA CONSUMER] Consumed PaymentCompletedEvent in Webhook Service: " + message);
        try {
            String paymentId = (String) message.get("paymentId");
            String status = (String) message.get("status");

            Map<String, Object> paymentData = paymentClient.getPaymentById(paymentId);
            String merchantEmail = (String) paymentData.get("merchantEmail");
            Double amount = Double.valueOf(String.valueOf(paymentData.get("amount")));

            String webhookUrl = "http://localhost:8090/webhook";
            try {
                Map<String, Object> merchantData = merchantClient.getMerchantByEmail(merchantEmail);
                if (merchantData != null && merchantData.containsKey("webhookUrl") && merchantData.get("webhookUrl") != null) {
                    webhookUrl = (String) merchantData.get("webhookUrl");
                }
            } catch (Exception ex) {
                System.err.println("Could not resolve custom webhook URL from merchant-service. Using default: " + ex.getMessage());
            }

            System.out.println("==========================================");
            System.out.println("[WEBHOOK DISPATCH] Target Endpoint: " + webhookUrl);
            System.out.println("[WEBHOOK PAYLOAD] Payment: " + paymentId + " | Status: " + status + " | Amount: " + amount);
            System.out.println("==========================================");

            String logId = "WHK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            WebhookLog log = WebhookLog.builder()
                    .id(logId)
                    .endpoint(webhookUrl)
                    .payload(String.format("{\"paymentId\": \"%s\", \"status\": \"%s\", \"amount\": %f}", paymentId, status, amount))
                    .status("Success")
                    .responseCode(200)
                    .retries(0)
                    .timestamp(LocalDateTime.now())
                    .build();

            logRepository.save(log);
            System.out.println("[WEBHOOK] Saved webhook dispatch log: " + logId);

        } catch (Exception ex) {
            System.err.println("Error processing webhook dispatch: " + ex.getMessage());
        }
    }
}
