package com.enterprise.fraud.repository;

import com.enterprise.fraud.entity.FraudCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FraudCaseRepository extends JpaRepository<FraudCase, String> {
    Optional<FraudCase> findByTransactionId(String transactionId);
}
