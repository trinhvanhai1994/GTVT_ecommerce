# Architecture Decision Records

Các quyết định kiến trúc được ghi tại Phase 1. Không thay đổi âm thầm.

---

## ADR-001 — Microservices thay vì Monolith

**Status:** Accepted  
**Date:** 2026-09-05

### Context

Đồ án yêu cầu hệ thống e-commerce với Spring Boot + Spring Cloud, nhiều bounded context.

### Decision

Dùng microservices: Auth, Product, Cart, Inventory, Order, Payment, Notification + Gateway + Eureka.

### Reason

Đúng yêu cầu học thuật; ranh giới nghiệp vụ rõ; cho phép demo sync, async, saga.

### Impact

Phức tạp hơn monolith. Bù lại bằng phạm vi hẹp, mock payment, một PostgreSQL nhiều logical DB.

---

## ADR-002 — Database per Service

**Status:** Accepted

### Context

Cần ownership dữ liệu rõ, tránh coupling schema.

### Decision

Mỗi service một logical database. Không FK cross-service. Tham chiếu bằng ID.

### Impact

Không join cross-db. Cần snapshot order item. Consistency giữa inventory và order dùng Saga, không 2PC.

---

## ADR-003 — API Gateway

**Status:** Accepted

### Decision

Frontend chỉ gọi Spring Cloud Gateway. Gateway routing + CORS (+ JWT filter ở Phase 2).

### Reason

Một entry point; ẩn topology nội bộ; dễ áp dụng cross-cutting.

---

## ADR-004 — Eureka Service Discovery

**Status:** Accepted

### Decision

Netflix Eureka cho registration/lookup. Gateway và Feign dùng discovery name (`AUTH-SERVICE`, …).

### Reason

Đúng stack Spring Cloud của đề bài; tránh hard-code host khi chạy Docker.

---

## ADR-005 — RabbitMQ cho Notification

**Status:** Accepted

### Decision

Event đơn hàng/thanh toán đi RabbitMQ. Notification Service consume. Order không chờ notification commit.

### Reason

BR-12: notification failure không rollback order. Async tách vòng đời thông báo khỏi checkout.

---

## ADR-006 — Mock Payment

**Status:** Accepted

### Decision

Payment Service giả lập SUCCESS/FAILED. Method: COD, MOCK_CARD, MOCK_BANKING. Không cổng thật.

### Reason

Đề bài cấm payment gateway thật. Vẫn đủ demo golden path và failure path.

---

## ADR-007 — Saga orchestration tại Order Service

**Status:** Accepted

### Decision

Order Service điều phối: create → check → reserve → pay → confirm/compensate. Không distributed transaction.

### Compensation

Payment FAILED → release inventory → order PAYMENT_FAILED.

### Reason

Đủ đúng nghiệp vụ, giải thích được khi bảo vệ, không over-engineer (không dùng framework saga nặng).

---

## ADR-008 — Java 21 + Spring Boot 3.4 + package `gtvt.haitv.ecommerce`

**Status:** Accepted

### Decision

Java 21 LTS, Spring Boot 3.4.x, Spring Cloud 2024.0.x. Package theo form `gtvt.haitv.ecommerce.*`.

### Note

Máy local lúc inspect đang default Java 8. Build phải trỏ `JAVA_HOME` sang JDK 21.

---

## ADR-009 — Một MySQL container, nhiều logical database

**Status:** Superseded by ADR-010

### Decision

Docker Compose chạy một MySQL, script tạo 7 database. Vẫn là database-per-service về mặt logic.

### Reason

Giảm tài nguyên máy đồ án; không vi phạm nguyên tắc ownership.

---

## ADR-010 — PostgreSQL local thay vì MySQL Docker

**Status:** Accepted  
**Date:** 2026-09-05

### Proposed Change

#### Current

Phase 1 dùng một MySQL 8 container (`localhost:3306`, user `ecommerce`) với 7 logical database.

#### Proposed

Dùng PostgreSQL 17 đã cài trên máy dev:

- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: lấy từ `DB_PASSWORD` (local default `123456`)

Vẫn tạo 7 logical database: `auth_db`, `product_db`, `cart_db`, `inventory_db`, `order_db`, `payment_db`, `notification_db`.

#### Reason

Yêu cầu môi trường thực tế của máy triển khai. Port 5432 đã có PostgreSQL; không mở thêm MySQL 3306.

#### Impact

- JDBC URL đổi sang `jdbc:postgresql://...`
- Hibernate dialect: `PostgreSQLDialect`
- Docker Compose không còn service MySQL (tránh đụng port / nhầm hạ tầng)
- Script khởi tạo: `docker/postgres/init-databases.sql`
- Nguyên tắc Database per Service **không đổi**

#### Decision

Accepted. Ghi nhận lệch so với `00-OVERVIEW.md` (MySQL) vì user chỉ định PostgreSQL local.

---

## ADR-011 — Shared `common` module (JWT + API envelope + events)

**Status:** Accepted  
**Date:** 2026-09-05

### Proposed Change

#### Current

Phase 1: mỗi service là module độc lập, không có shared library.

#### Proposed

Thêm module Maven `common` (JAR, không phải microservice) chứa:

- `ApiResponse` / `ErrorResponse` / `GlobalExceptionHandler` / `ApiException`
- JWT (`JwtService`, `JwtAuthFilter`, `AuthenticatedUser`)
- `OrderEvent` payload cho RabbitMQ

#### Reason

JWT secret/claims phải giống nhau giữa Auth (issue) và các service (validate). Duplicate 7 lần dễ lệch và khó bảo vệ.

#### Impact

- Coupling compile-time nhỏ (thư viện, không phải database).
- Vẫn Database per Service. Không query xuyên DB.
- Không biến `common` thành “god service”.

#### Decision

Accepted cho Phase 2.

