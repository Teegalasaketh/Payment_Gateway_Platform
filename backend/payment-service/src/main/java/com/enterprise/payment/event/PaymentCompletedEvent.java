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
public class PaymentCompletedEvent {
    private String eventId;
    private String paymentId;
    private String status;
    private String referenceNumber;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
