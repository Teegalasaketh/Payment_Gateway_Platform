package com.enterprise.payment.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreatedEvent {
    private String eventId;
    private String paymentId;
    private Double amount;
    private String currency;
    private String merchantId;
    private String customerEmail;
    private String paymentMethod;
    private String cvv;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
