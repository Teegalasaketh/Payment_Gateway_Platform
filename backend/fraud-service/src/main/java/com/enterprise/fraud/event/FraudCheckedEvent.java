package com.enterprise.fraud.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudCheckedEvent {
    private String paymentId;
    private Integer riskScore;
    private String status;
}
