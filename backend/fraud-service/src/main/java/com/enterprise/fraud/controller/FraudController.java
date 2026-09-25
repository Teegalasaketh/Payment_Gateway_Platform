package com.enterprise.fraud.controller;

import com.enterprise.fraud.entity.FraudCase;
import com.enterprise.fraud.repository.FraudCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fraud")
public class FraudController {

    @Autowired
    private FraudCaseRepository caseRepository;

    @GetMapping("/cases")
    public ResponseEntity<List<FraudCase>> getAllCases() {
        return ResponseEntity.ok(caseRepository.findAll());
    }

    @PostMapping("/cases/{id}/resolve")
    public ResponseEntity<?> resolveCase(@PathVariable String id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        FraudCase fCase = caseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud case record not found for id: " + id));
        fCase.setStatus(status);
        FraudCase saved = caseRepository.save(fCase);
        return ResponseEntity.ok(saved);
    }
}
