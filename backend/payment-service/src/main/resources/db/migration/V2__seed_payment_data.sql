-- Seed payments for user@enterprise.com spanning the past 7 days
INSERT INTO payments (id, amount, currency, method, status, customer_name, customer_email, merchant_email, date)
VALUES
('PAY-000001', 1250.00, 'INR', 'CREDIT_CARD', 'SUCCESS', 'John Doe', 'john@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '6 day'),
('PAY-000002', 3200.50, 'INR', 'CREDIT_CARD', 'SUCCESS', 'Alice Smith', 'alice@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '5 day'),
('PAY-000003', 150.00, 'INR', 'CREDIT_CARD', 'FAILED', 'Bob Johnson', 'bob@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '5 day'),
('PAY-000004', 4500.00, 'INR', 'BANK_TRANSFER', 'SUCCESS', 'Charlie Brown', 'charlie@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '4 day'),
('PAY-000005', 850.25, 'INR', 'CREDIT_CARD', 'SUCCESS', 'Diana Prince', 'diana@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '3 day'),
('PAY-000006', 120.00, 'INR', 'CREDIT_CARD', 'PENDING', 'Ethan Hunt', 'ethan@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '2 day'),
('PAY-000007', 9500.00, 'INR', 'BANK_TRANSFER', 'SUCCESS', 'Fiona Gallagher', 'fiona@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '2 day'),
('PAY-000008', 210.00, 'INR', 'CREDIT_CARD', 'SUCCESS', 'George Clark', 'george@gmail.com', 'user@enterprise.com', CURRENT_DATE - INTERVAL '1 day'),
('PAY-000009', 1500.00, 'INR', 'CREDIT_CARD', 'SUCCESS', 'Hannah Montana', 'hannah@gmail.com', 'user@enterprise.com', CURRENT_DATE),
('PAY-000010', 350.00, 'INR', 'CREDIT_CARD', 'FAILED', 'Ian Malcolm', 'ian@gmail.com', 'user@enterprise.com', CURRENT_DATE);
