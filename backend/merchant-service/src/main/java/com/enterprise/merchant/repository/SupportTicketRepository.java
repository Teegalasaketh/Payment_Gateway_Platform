package com.enterprise.merchant.repository;

import com.enterprise.merchant.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, String> {
    List<SupportTicket> findByMerchantEmailOrderByCreatedAtDesc(String merchantEmail);
}
