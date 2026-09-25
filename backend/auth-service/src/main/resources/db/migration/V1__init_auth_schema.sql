CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Seed default user and admin account (passwords are BCrypt hashed: 'password' is '$2a$10$8.UnVuG9HHgffUDAlk8GP.35GL5b1Rej84XSg.m17sH7ORfy3s8pm')
INSERT INTO users (name, email, password, role, avatar_url, active)
VALUES 
('Merchant Administrator', 'user@enterprise.com', '$2a$10$8.UnVuG9HHgffUDAlk8GP.35GL5b1Rej84XSg.m17sH7ORfy3s8pm', 'USER', NULL, TRUE),
('System Administrator', 'admin@enterprise.com', '$2a$10$8.UnVuG9HHgffUDAlk8GP.35GL5b1Rej84XSg.m17sH7ORfy3s8pm', 'ADMIN', NULL, TRUE);
