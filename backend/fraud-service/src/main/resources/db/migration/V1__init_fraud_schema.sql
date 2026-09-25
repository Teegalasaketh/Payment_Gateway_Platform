CREATE TABLE fraud_cases (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    ip_address VARCHAR(255) NOT NULL,
    device VARCHAR(255) NOT NULL,
    risk_score INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
