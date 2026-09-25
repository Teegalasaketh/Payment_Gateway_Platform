package com.enterprise.webhook.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class FeignConfiguration {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null) requestTemplate.header("Authorization", authHeader);

                String emailHeader = request.getHeader("X-User-Email");
                if (emailHeader != null) requestTemplate.header("X-User-Email", emailHeader);

                String rolesHeader = request.getHeader("X-User-Roles");
                if (rolesHeader != null) requestTemplate.header("X-User-Roles", rolesHeader);

                String idHeader = request.getHeader("X-User-Id");
                if (idHeader != null) requestTemplate.header("X-User-Id", idHeader);

                String gatewayHeader = request.getHeader("X-Gateway-Token");
                if (gatewayHeader != null) {
                    requestTemplate.header("X-Gateway-Token", gatewayHeader);
                } else {
                    requestTemplate.header("X-Gateway-Token", "aegis-gateway-trusted-secret-key-1092");
                }
            }
        };
    }
}
