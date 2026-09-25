CREATE TABLE merchants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(500),
    settlement_account VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

INSERT INTO merchants (id, name, email, api_key, webhook_url, settlement_account, status)
VALUES 
('MERCH-9921', 'Merchant Administrator', 'user@enterprise.com', 'ak_test_51MzS2hS7oJdE2JjK9X8L2Y4N7P0Q1R3S', 'http://localhost:8090/webhook', 'NL54ABNA0412345678', 'ACTIVE');
