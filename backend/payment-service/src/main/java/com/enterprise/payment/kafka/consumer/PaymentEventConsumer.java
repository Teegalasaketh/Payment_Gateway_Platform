package com.enterprise.payment.kafka.consumer;

import com.enterprise.payment.entity.Payment;
import com.enterprise.payment.enums.PaymentStatus;
import com.enterprise.payment.kafka.producer.PaymentEventProducer;
import com.enterprise.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.UUID;

@Component
public class PaymentEventConsumer {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentEventProducer eventProducer;

    private static final String TOPIC_FRAUD_CHECKED = "fraud-checked-events";

    @KafkaListener(topics = TOPIC_FRAUD_CHECKED, groupId = "payment-group")
    public void consumeFraudChecked(Map<String, Object> message) {
        System.out.println("[KAFKA CONSUMER] Consumed FraudCheckedEvent in Payment Service: " + message);
        try {
            String paymentId = (String) message.get("paymentId");
            String status = (String) message.get("status");

            paymentRepository.findById(paymentId).ifPresentOrElse(payment -> {
                if ("APPROVED".equalsIgnoreCase(status)) {
                    payment.setStatus(PaymentStatus.SUCCESS);
                } else {
                    payment.setStatus(PaymentStatus.FAILED);
                }
                Payment saved = paymentRepository.save(payment);
                System.out.println("[KAFKA CONSUMER] Updated payment " + paymentId + " status to: " + saved.getStatus());

                // Emit PaymentCompletedEvent to notify transaction-service and webhook-service
                String referenceNumber = "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                eventProducer.sendPaymentCompletedEvent(saved, referenceNumber);
            }, () -> {
                System.err.println("Payment not found: " + paymentId);
            });
        } catch (Exception ex) {
            System.err.println("Error processing consumed FraudCheckedEvent in payment service: " + ex.getMessage());
        }
    }
}
