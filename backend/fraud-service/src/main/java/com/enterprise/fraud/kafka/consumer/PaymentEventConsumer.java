package com.enterprise.fraud.kafka.consumer;

import com.enterprise.fraud.entity.FraudCase;
import com.enterprise.fraud.event.FraudCheckedEvent;
import com.enterprise.fraud.repository.FraudCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Component
public class PaymentEventConsumer {

    @Autowired
    private FraudCaseRepository fraudCaseRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_CREATED = "payment-events-created";
    private static final String TOPIC_FRAUD_CHECKED = "fraud-checked-events";

    @KafkaListener(topics = TOPIC_CREATED, groupId = "fraud-group")
    public void consumePaymentCreated(Map<String, Object> message) {
        System.out.println("[KAFKA CONSUMER] Consumed PaymentCreatedEvent in Fraud Service: " + message);
        try {
            String paymentId = (String) message.get("paymentId");
            Double amount = Double.valueOf(String.valueOf(message.get("amount")));
            String cvv = (String) message.get("cvv");
            String email = (String) message.get("customerEmail");

            int riskScore = 15;
            if ("999".equals(cvv)) {
                riskScore = 99;
            } else if (amount > 50000) {
                riskScore = 85;
            } else {
                riskScore = 5 + new Random().nextInt(25);
            }

            String status = (riskScore > 75) ? "FLAGGED" : "APPROVED";

            String caseId = "FC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            FraudCase fraudCase = FraudCase.builder()
                    .id(caseId)
                    .customerName("Aegis Customer")
                    .customerEmail(email != null ? email : "customer@aegis-payment.com")
                    .transactionId(paymentId)
                    .amount(amount)
                    .ipAddress("127.0.0.1")
                    .device("Desktop (Web)")
                    .riskScore(riskScore)
                    .status(status)
                    .timestamp(LocalDateTime.now())
                    .build();

            fraudCaseRepository.save(fraudCase);
            System.out.println("[KAFKA CONSUMER] Written FraudCase record: " + caseId + " for payment: " + paymentId);

            // Publish FraudCheckedEvent back to Kafka
            FraudCheckedEvent checkedEvent = FraudCheckedEvent.builder()
                    .paymentId(paymentId)
                    .riskScore(riskScore)
                    .status(status)
                    .build();

            if (kafkaTemplate != null) {
                kafkaTemplate.send(TOPIC_FRAUD_CHECKED, paymentId, checkedEvent);
                System.out.println("[KAFKA PRODUCER] Emitted FraudCheckedEvent for payment: " + paymentId);
            }
        } catch (Exception ex) {
            System.err.println("Error processing consumed PaymentCreatedEvent in fraud service: " + ex.getMessage());
        }
    }
}
