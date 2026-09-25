package com.enterprise.transaction.service;

import com.enterprise.transaction.entity.Transaction;
import java.util.List;

public interface TransactionService {
    Transaction createTransaction(Transaction transaction);
    List<Transaction> getAllTransactions();
    List<Transaction> getTransactionsByPaymentId(String paymentId);
}
