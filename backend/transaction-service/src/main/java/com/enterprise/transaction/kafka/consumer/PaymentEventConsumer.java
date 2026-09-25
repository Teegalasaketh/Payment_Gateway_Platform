package com.enterprise.transaction.kafka.consumer;

import com.enterprise.transaction.entity.Transaction;
import com.enterprise.transaction.enums.TransactionType;
import com.enterprise.transaction.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
public class PaymentEventConsumer {

    @Autowired
    private TransactionRepository transactionRepository;

    private static final String TOPIC_CREATED = "payment-events-created";
    private static final String TOPIC_COMPLETED = "payment-events-completed";

    @KafkaListener(topics = TOPIC_CREATED, groupId = "transaction-group")
    public void consumePaymentCreated(Map<String, Object> message) {
        System.out.println("[KAFKA CONSUMER] Consumed PaymentCreatedEvent payload: " + message);
        try {
            String paymentId = (String) message.get("paymentId");
            Double amount = Double.valueOf(String.valueOf(message.get("amount")));

            String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            Transaction transaction = Transaction.builder()
                    .id(txnId)
                    .paymentId(paymentId)
                    .type(TransactionType.DEBIT)
                    .amount(amount)
                    .status("Pending")
                    .timestamp(LocalDateTime.now())
                    .build();

            transactionRepository.save(transaction);
            System.out.println("[KAFKA CONSUMER] Written transaction record " + txnId + " for payment " + paymentId);
        } catch (Exception ex) {
            System.err.println("Error processing consumed PaymentCreatedEvent in transaction service: " + ex.getMessage());
        }
    }

    @KafkaListener(topics = TOPIC_COMPLETED, groupId = "transaction-group")
    public void consumePaymentCompleted(Map<String, Object> message) {
        System.out.println("[KAFKA CONSUMER] Consumed PaymentCompletedEvent payload: " + message);
        try {
            String paymentId = (String) message.get("paymentId");
            String status = (String) message.get("status");

            transactionRepository.findFirstByPaymentIdOrderByTimestampDesc(paymentId)
                    .ifPresentOrElse(txn -> {
                        txn.setStatus("SUCCESS".equalsIgnoreCase(status) ? "Success" : "Failed");
                        transactionRepository.save(txn);
                        System.out.println("[KAFKA CONSUMER] Updated transaction record status to: " + txn.getStatus());
                    }, () -> {
                        System.err.println("No transaction ledger found for payment: " + paymentId);
                    });
        } catch (Exception ex) {
            System.err.println("Error processing consumed PaymentCompletedEvent in transaction service: " + ex.getMessage());
        }
    }
}
