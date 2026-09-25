CREATE TABLE webhook_logs (
    id VARCHAR(50) PRIMARY KEY,
    endpoint VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_code INT,
    payload TEXT,
    retries INT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
