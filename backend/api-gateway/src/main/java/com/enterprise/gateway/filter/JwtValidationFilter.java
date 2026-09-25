package com.enterprise.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.UUID;

@Component
public class JwtValidationFilter extends AbstractGatewayFilterFactory<JwtValidationFilter.Config> {

    @Value("${security.jwt.secret:aegissecretkeyforpaymentgatewaysecuritysystemjwtvalidations}")
    private String jwtSecret;

    public JwtValidationFilter() {
        super(Config.class);
    }

    public static class Config {
        // configuration properties
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 1. Trace ID generation
            String traceId = UUID.randomUUID().toString();
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-Trace-ID", traceId)
                    .build();

            // Set trace ID in response headers
            exchange.getResponse().getHeaders().add("X-Trace-ID", traceId);

            // 2. Bypass authentication for open routes
            if (isBypassedPath(path)) {
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            }

            // 3. Extract Authorization Header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return handleUnauthorized(exchange, "Missing Authorization Header");
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return handleUnauthorized(exchange, "Invalid Authorization Header Format");
            }

            String token = authHeader.substring(7);

            try {
                // 4. Parse & Validate JWT Claims
                Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String email = claims.getSubject();
                String role = claims.get("role", String.class);
                String userId = String.valueOf(claims.get("id"));

                // 5. Inject Claims into downstream request headers
                ServerHttpRequest.Builder requestBuilder = mutatedRequest.mutate();
                if (email != null) requestBuilder.header("X-User-Email", email);
                if (role != null) requestBuilder.header("X-User-Roles", "ROLE_" + role.toUpperCase());
                if (userId != null) requestBuilder.header("X-User-Id", userId);

                // Add security token to let downstream microservices trust the API Gateway
                requestBuilder.header("X-Gateway-Token", "aegis-gateway-trusted-secret-key-1092");

                return chain.filter(exchange.mutate().request(requestBuilder.build()).build());

            } catch (Exception e) {
                return handleUnauthorized(exchange, "JWT signature verification or expiration check failed: " + e.getMessage());
            }
        };
    }

    private boolean isBypassedPath(String path) {
        return path.contains("/auth/login") ||
               path.contains("/auth/register") ||
               path.contains("/auth/verify-otp") ||
               path.contains("/auth/forgot-password") ||
               path.contains("/auth/reset-password") ||
               path.contains("/actuator");
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        byte[] bytes = String.format("{\"error\": \"Unauthorized\", \"message\": \"%s\"}", message).getBytes(StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }
}
