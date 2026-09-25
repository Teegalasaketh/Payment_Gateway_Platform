package com.enterprise.payment.service.impl;

import com.enterprise.payment.client.MerchantClient;
import com.enterprise.payment.dto.CheckoutRequest;
import com.enterprise.payment.entity.Payment;
import com.enterprise.payment.enums.PaymentMethod;
import com.enterprise.payment.enums.PaymentStatus;
import com.enterprise.payment.kafka.producer.PaymentEventProducer;
import com.enterprise.payment.repository.PaymentRepository;
import com.enterprise.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentEventProducer eventProducer;

    @Autowired
    private MerchantClient merchantClient;

    @Override
    public Payment createPayment(CheckoutRequest request) {
        String generatedId = "PAY-" + String.format("%06d", new Random().nextInt(1000000));
        PaymentMethod method = PaymentMethod.fromString(request.getMethod());

        String merchantEmail = "user@enterprise.com";
        String merchantId = "MERCH-9921";

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            merchantEmail = auth.getName();
        }

        try {
            Map<String, Object> merchantData = merchantClient.getMerchantByEmail(merchantEmail);
            if (merchantData != null && merchantData.containsKey("id")) {
                merchantId = (String) merchantData.get("id");
            }
        } catch (Exception ex) {
            System.err.println("[MERCHANT SERVICE OFFLINE] Falling back to default merchant credentials. " + ex.getMessage());
        }

        Payment payment = Payment.builder()
                .id(generatedId)
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .method(method)
                .status(PaymentStatus.PENDING)
                .customerName(request.getCardHolder() != null ? request.getCardHolder() : "Aegis Customer")
                .customerEmail("customer@aegis-payment.com")
                .merchantEmail(merchantEmail)
                .date(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        try {
            eventProducer.sendPaymentCreatedEvent(saved, request.getCvv(), merchantId);
        } catch (Exception ex) {
            System.err.println("[KAFKA BROKER OFFLINE] Falling back to synchronous processing logic. " + ex.getMessage());
            if ("999".equals(request.getCvv()) || request.getAmount() > 50000) {
                saved.setStatus(PaymentStatus.FAILED);
            } else {
                saved.setStatus(PaymentStatus.SUCCESS);
            }
            saved = paymentRepository.save(saved);
        }

        return saved;
    }

    @Override
    public Payment refundPayment(String id) {
        Payment payment = getPaymentById(id);
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Only successful transactions can be refunded.");
        }
        payment.setStatus(PaymentStatus.REFUNDED);
        return paymentRepository.save(payment);
    }

    @Override
    public Payment retryPayment(String id) {
        Payment payment = getPaymentById(id);
        payment.setStatus(PaymentStatus.SUCCESS);
        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getAllPayments() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                return paymentRepository.findAll();
            } else {
                return paymentRepository.findByMerchantEmail(auth.getName());
            }
        }
        return paymentRepository.findAll();
    }

    @Override
    public Payment getPaymentById(String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for id: " + id));
    }

    @Override
    public void savePayment(Payment payment) {
        paymentRepository.save(payment);
    }
}
