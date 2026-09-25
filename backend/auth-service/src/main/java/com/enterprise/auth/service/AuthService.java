package com.enterprise.auth.service;

import com.enterprise.auth.entity.User;
import java.util.Map;

public interface AuthService {
    Map<String, Object> login(String email, String password, String roleSelection);
    User register(String email, String name, String password, String role);
    Map<String, Object> verifyOtp(String email, String code);
    void forgotPassword(String email);
    void resetPassword(String email, String resetKey, String newPassword);
}
