package com.enterprise.webhook.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;

@FeignClient(name = "merchant-service")
public interface MerchantClient {

    @GetMapping("/api/merchants/by-email")
    Map<String, Object> getMerchantByEmail(@RequestParam("email") String email);
}
