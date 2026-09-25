package com.enterprise.payment.kafka.producer;

import com.enterprise.payment.entity.Payment;
import com.enterprise.payment.event.PaymentCreatedEvent;
import com.enterprise.payment.event.PaymentCompletedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class PaymentEventProducer {

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_CREATED = "payment-events-created";
    private static final String TOPIC_COMPLETED = "payment-events-completed";

    public void sendPaymentCreatedEvent(Payment payment, String cvv, String merchantId) {
        PaymentCreatedEvent event = PaymentCreatedEvent.builder()
                .eventId("evt-" + UUID.randomUUID().toString().substring(0, 8))
                .paymentId(payment.getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .merchantId(merchantId)
                .customerEmail(payment.getCustomerEmail())
                .paymentMethod(payment.getMethod().name())
                .cvv(cvv)
                .build();

        System.out.println("[KAFKA PRODUCER] Emitting PaymentCreatedEvent: " + event);
        if (kafkaTemplate != null) {
            kafkaTemplate.send(TOPIC_CREATED, payment.getId(), event);
        }
    }

    public void sendPaymentCompletedEvent(Payment payment, String referenceNumber) {
        PaymentCompletedEvent event = PaymentCompletedEvent.builder()
                .eventId("evt-" + UUID.randomUUID().toString().substring(0, 8))
                .paymentId(payment.getId())
                .status(payment.getStatus().name())
                .referenceNumber(referenceNumber)
                .build();

        System.out.println("[KAFKA PRODUCER] Emitting PaymentCompletedEvent: " + event);
        if (kafkaTemplate != null) {
            kafkaTemplate.send(TOPIC_COMPLETED, payment.getId(), event);
        }
    }
}
