package com.enterprise.payment.enums;

public enum PaymentMethod {
    CREDIT_CARD,
    DEBIT_CARD,
    BANK_TRANSFER,
    PAYPAL,
    CRYPTO,
    UPI,
    WALLET,
    NET_BANKING;

    public static PaymentMethod fromString(String method) {
        if (method == null) return CREDIT_CARD;
        try {
            return PaymentMethod.valueOf(method.toUpperCase().replace(" ", "_"));
        } catch (Exception ex) {
            return CREDIT_CARD;
        }
    }
}
