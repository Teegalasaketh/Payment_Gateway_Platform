INSERT INTO webhook_logs (id, endpoint, status, response_code, payload, retries, timestamp)
VALUES
('WHK-000001', 'http://localhost:8090/webhook', 'Success', 200, '{"paymentId": "PAY-000001", "status": "Success", "amount": 1250.00}', 0, CURRENT_DATE - INTERVAL '6 day'),
('WHK-000002', 'http://localhost:8090/webhook', 'Success', 200, '{"paymentId": "PAY-000002", "status": "Success", "amount": 3200.50}', 0, CURRENT_DATE - INTERVAL '5 day'),
('WHK-000003', 'http://localhost:8090/webhook', 'Success', 200, '{"paymentId": "PAY-000004", "status": "Success", "amount": 4500.00}', 0, CURRENT_DATE - INTERVAL '4 day'),
('WHK-000004', 'http://localhost:8090/webhook', 'Success', 200, '{"paymentId": "PAY-000005", "status": "Success", "amount": 850.25}', 0, CURRENT_DATE - INTERVAL '3 day'),
('WHK-000005', 'http://localhost:8090/webhook', 'Success', 200, '{"paymentId": "PAY-000007", "status": "Success", "amount": 9500.00}', 0, CURRENT_DATE - INTERVAL '2 day'),
('WHK-000006', 'http://localhost:8090/webhook', 'Success', 200, '{"paymentId": "PAY-000008", "status": "Success", "amount": 210.00}', 0, CURRENT_DATE - INTERVAL '1 day'),
('WHK-000007', 'http://localhost:8090/webhook', 'Success', 200, '{"paymentId": "PAY-000009", "status": "Success", "amount": 1500.00}', 0, CURRENT_DATE);
