package com.enterprise.merchant.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "merchants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Merchant {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "api_key", nullable = false)
    private String apiKey;

    @Column(name = "webhook_url")
    private String webhookUrl;

    @Column(name = "settlement_account", nullable = false)
    private String settlementAccount;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
