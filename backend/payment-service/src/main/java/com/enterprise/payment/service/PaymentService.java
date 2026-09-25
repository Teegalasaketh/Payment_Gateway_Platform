package com.enterprise.payment.service;

import com.enterprise.payment.dto.CheckoutRequest;
import com.enterprise.payment.entity.Payment;
import java.util.List;

public interface PaymentService {
    Payment createPayment(CheckoutRequest request);
    Payment refundPayment(String id);
    Payment retryPayment(String id);
    List<Payment> getAllPayments();
    Payment getPaymentById(String id);
    void savePayment(Payment payment);
}
