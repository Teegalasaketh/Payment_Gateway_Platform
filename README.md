# Payment Gateway Platform

An enterprise-grade, high-throughput payment orchestration and anomaly monitoring console built with **Spring Boot** and **React (Vite/TS/Tailwind)**.

---

## Architecture Overview

- **Frontend (Root)**: React single-page dashboard featuring charts (TanStack Table + Recharts), visual payment forms, and dynamic logs inspect panels.
- **Backend (`backend/`)**: Spring Boot REST microservice configured with Spring Security, JWT authentication, Redis (idempotency checks), and Apache Kafka (event processing).
- **Orchestration**: `docker-compose.yml` launches PostgreSQL, Redis, Zookeeper, and Kafka.

---

## Quick Start Guide

### Prerequisites
Make sure you have the following installed on your machine:
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop)
- [Java JDK 17+](https://adoptium.net/)
- [Apache Maven 3.8+](https://maven.apache.org/download.cgi)
- [Node.js 18+](https://nodejs.org/)

---

### Step 1: Start External Infrastructure (Docker)
From the project root folder, launch the databases and message queues:
```bash
docker compose up -d
```
This spins up:
- **PostgreSQL** (`localhost:5432` - Db: `payment_gateway`, User: `postgres`, Pass: `postgres`)
- **Redis Cache** (`localhost:6379`)
- **Kafka Broker** (`localhost:9092`)

---

### Step 2: Compile & Run the Spring Boot Backend
Navigate to the `backend/` directory, compile the application, and start the server:
```bash
cd backend
mvn spring-boot:run
```
Upon startup, the database is auto-seeded with standard mock datasets:
- **50 Users** (Standard accounts: `admin@enterprise.com`, `user@enterprise.com` - Password: `password123`)
- **200 Payments**
- **500 Transactions** (Auth, Capture, Refund, Payout logs)
- **30 Anomaly Fraud cases**
- **100 Webhook callback logs**

Swagger UI API documentation is auto-generated and visible at:
- http://localhost:8080/swagger-ui/index.html

---

### Step 3: Start the Vite Frontend Console
From the project root directory, install npm packages and run the Vite dev server:
```bash
# Set up environment variables
copy .env.example .env

# Start React app
npm install
npm run dev
```
Open your browser at:
- http://localhost:5173

---

## Authentication Bypass & Testing Scenarios

1. **Log in credentials**:
   - **Administrator Access**: email `admin@enterprise.com`, password `password123`.
   - **Merchant Access**: email `user@enterprise.com`, password `password123`.
2. **OTP Verification bypass**:
   - Any login generates a random 6-digit OTP code printed to the Spring Boot stdout console, but you can enter `123456` or `000000` to bypass this check.
3. **Decline simulator test**:
   - Go to *Send Payment* form, select *Credit Card*, and enter CVV **999** to trigger a mock bank decline outcome.
   - Enter amount > **50000** to trigger an insufficient funds decline.
4. **Idempotency collision test**:
   - Resending a payment with the same transaction token triggers an idempotency collision block (HTTP 409 Conflict) protecting the system from double charging.
