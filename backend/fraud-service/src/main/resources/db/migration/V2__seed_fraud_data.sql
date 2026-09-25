INSERT INTO fraud_cases (id, customer_name, customer_email, transaction_id, amount, ip_address, device, risk_score, status, timestamp)
VALUES
('FC-000001', 'Bob Johnson', 'bob@gmail.com', 'PAY-000003', 150.00, '192.168.1.99', 'Mobile', 99, 'FLAGGED', CURRENT_DATE - INTERVAL '5 day'),
('FC-000002', 'Ian Malcolm', 'ian@gmail.com', 'PAY-000010', 350.00, '172.16.8.22', 'Desktop', 85, 'FLAGGED', CURRENT_DATE);
