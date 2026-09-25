# PowerShell script to compile all microservice modules at once

Write-Host "Building Eureka Discovery Server..." -ForegroundColor Cyan
cd backend/discovery-server
mvn clean package -DskipTests
cd ../..

Write-Host "Building Config Server..." -ForegroundColor Cyan
cd backend/config-server
mvn clean package -DskipTests
cd ../..

Write-Host "Building API Gateway..." -ForegroundColor Cyan
cd backend/api-gateway
mvn clean package -DskipTests
cd ../..

Write-Host "Building Auth Service..." -ForegroundColor Cyan
cd backend/auth-service
mvn clean package -DskipTests
cd ../..

Write-Host "Building Merchant Service..." -ForegroundColor Cyan
cd backend/merchant-service
mvn clean package -DskipTests
cd ../..

Write-Host "Building Payment Service..." -ForegroundColor Cyan
cd backend/payment-service
mvn clean package -DskipTests
cd ../..

Write-Host "Building Transaction Service..." -ForegroundColor Cyan
cd backend/transaction-service
mvn clean package -DskipTests
cd ../..

Write-Host "Building Fraud Service..." -ForegroundColor Cyan
cd backend/fraud-service
mvn clean package -DskipTests
cd ../..

Write-Host "Building Webhook Service..." -ForegroundColor Cyan
cd backend/webhook-service
mvn clean package -DskipTests
cd ../..

Write-Host "All microservices compiled successfully!" -ForegroundColor Green
