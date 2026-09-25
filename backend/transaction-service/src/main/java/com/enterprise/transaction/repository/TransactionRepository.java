package com.enterprise.transaction.repository;

import com.enterprise.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByPaymentId(String paymentId);
    Optional<Transaction> findFirstByPaymentIdOrderByTimestampDesc(String paymentId);
}
