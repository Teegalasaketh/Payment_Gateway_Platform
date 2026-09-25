package com.enterprise.transaction.service.impl;

import com.enterprise.transaction.client.PaymentClient;
import com.enterprise.transaction.entity.Transaction;
import com.enterprise.transaction.repository.TransactionRepository;
import com.enterprise.transaction.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PaymentClient paymentClient;

    @Override
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public List<Transaction> getAllTransactions() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                return transactionRepository.findAll();
            } else {
                try {
                    List<Map<String, Object>> paymentsList = paymentClient.getAllPayments();
                    if (paymentsList == null || paymentsList.isEmpty()) {
                        return List.of();
                    }
                    List<String> paymentIds = paymentsList.stream()
                            .map(p -> (String) p.get("id"))
                            .toList();
                    
                    return transactionRepository.findAll().stream()
                            .filter(txn -> paymentIds.contains(txn.getPaymentId()))
                            .toList();
                } catch (Exception ex) {
                    System.err.println("[PAYMENT SERVICE OFFLINE] Returning empty transaction records list. " + ex.getMessage());
                    return List.of();
                }
            }
        }
        return transactionRepository.findAll();
    }

    @Override
    public List<Transaction> getTransactionsByPaymentId(String paymentId) {
        return transactionRepository.findByPaymentId(paymentId);
    }
}
