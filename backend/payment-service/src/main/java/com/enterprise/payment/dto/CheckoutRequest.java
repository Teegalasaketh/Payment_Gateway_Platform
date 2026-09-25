package com.enterprise.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private Double amount;
    private String currency;
    private String method; // Credit Card, Debit Card, UPI, etc.
    private String cardNumber;
    private String cardHolder;
    private String expiry;
    private String cvv;
    private String upiVpa;
    private String walletNumber;
    private String bankAccount;
    private String cryptoWallet;
}
