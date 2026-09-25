package com.enterprise.merchant.controller;

import com.enterprise.merchant.entity.SupportTicket;
import com.enterprise.merchant.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/merchants/support/tickets")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestHeader("X-User-Email") String email, @RequestBody SupportTicket request) {
        SupportTicket ticket = new SupportTicket();
        ticket.setId("TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setMerchantEmail(email);
        ticket.setSubject(request.getSubject());
        ticket.setMessage(request.getMessage());
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        SupportTicket saved = supportTicketRepository.save(ticket);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getTickets(@RequestHeader("X-User-Email") String email) {
        List<SupportTicket> tickets = supportTicketRepository.findByMerchantEmailOrderByCreatedAtDesc(email);
        return ResponseEntity.ok(tickets);
    }
}
