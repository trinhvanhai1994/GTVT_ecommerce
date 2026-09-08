# Chương 6 — Kiến trúc hệ thống

## 6.1 Bài toán kiến trúc

Hệ thống e-commerce có nhiều bounded context (identity, catalog, cart, inventory, order, payment, notification). Cần chọn kiến trúc đủ rõ để bảo vệ đồ án microservices, nhưng đủ đơn giản để hoàn thành.

## 6.2 Phương án xem xét

### Phương án A — Modular Monolith

Một ứng dụng Spring Boot, nhiều module, một database.

- Ưu: đơn giản, transaction mạnh, dễ deploy.
- Nhược: không đáp ứng yêu cầu đồ án “microservices + Spring Cloud”; khó demo discovery, gateway, messaging tách service.

### Phương án B — Microservices (chọn)

Nhiều service độc lập, database per service, API Gateway, Eureka, RabbitMQ.

- Ưu: đúng yêu cầu đồ án; ranh giới nghiệp vụ rõ; demo sync + async; scale theo service.
- Nhược: phức tạp hơn; cần Saga thay vì 2PC.
- Kiểm soát độ phức tạp: không service mesh, không Kafka, không payment gateway thật, không distributed tracing bắt buộc.

**Quyết định: Microservices.** Xem ADR-001.

## 6.3 Lý do chọn Microservices

1. Đề bài yêu cầu Spring Boot + Spring Cloud.
2. Các miền có vòng đời và dữ liệu khác nhau (catalog vs order vs payment).
3. Golden Path cần giao tiếp sync (Order ↔ Inventory ↔ Payment) và async (Order → RabbitMQ → Notification).
4. Database per service tránh FK xuyên service và làm rõ ownership dữ liệu.

## 6.4 High-level Architecture

```
                    +----------------+
                    |    FRONTEND    |
                    |     React      |
                    +-------+--------+
                            |
                            v
                    +----------------+
                    |  API GATEWAY   |
                    +-------+--------+
                            |
      +----------+----------+----------+----------+
      |          |          |          |          |
      v          v          v          v          v
  AUTH      PRODUCT      CART     INVENTORY    ORDER
 SERVICE    SERVICE    SERVICE    SERVICE     SERVICE
                                              |     |
                                              v     v
                                         PAYMENT  RabbitMQ
                                         SERVICE     |
                                                     v
                                               NOTIFICATION
                                                  SERVICE

Infrastructure: Eureka, PostgreSQL (logical DBs), RabbitMQ, Docker
```

Diagram nguồn: `docs/diagrams/architecture.mmd`, `docs/diagrams/system-context.mmd`, `docs/diagrams/deployment.mmd`.

## 6.5 Bounded Context → Service

| Bounded Context | Service | Database |
|-----------------|---------|----------|
| Identity & Access | auth-service | auth_db |
| Product Catalog | product-service | product_db |
| Shopping Cart | cart-service | cart_db |
| Inventory | inventory-service | inventory_db |
| Order Management | order-service | order_db |
| Payment | payment-service | payment_db |
| Notification | notification-service | notification_db |
| Edge | gateway | — |
| Discovery | eureka-server | — |

Không service nào query database của service khác. Cross-service chỉ dùng ID (`userId`, `productId`, `orderId`).

## 6.6 API Gateway

- Entry point duy nhất cho frontend: `/api/**`.
- Routing, CORS, (Phase 2) JWT filter nếu phù hợp.
- Internal inventory API không expose public trừ khi cần demo.

Routes:

| Path | Service |
|------|---------|
| `/api/auth/**` | AUTH-SERVICE |
| `/api/products/**` | PRODUCT-SERVICE |
| `/api/cart/**` | CART-SERVICE |
| `/api/inventory/**` | INVENTORY-SERVICE (admin/read nếu có) |
| `/api/orders/**` | ORDER-SERVICE |
| `/api/payments/**` | PAYMENT-SERVICE |
| `/api/admin/**` | ORDER-SERVICE / AUTH-SERVICE / PRODUCT-SERVICE tùy resource |

Internal:

- `/internal/inventory/check|reserve|release|deduct` — chỉ service-to-service.

## 6.7 Eureka

Mọi business service đăng ký:

AUTH-SERVICE, PRODUCT-SERVICE, CART-SERVICE, INVENTORY-SERVICE, ORDER-SERVICE, PAYMENT-SERVICE, NOTIFICATION-SERVICE.

Gateway resolve service bằng discovery.

## 6.8 Communication

**Synchronous (REST / OpenFeign):**

- Order → Inventory (check, reserve, release, deduct)
- Order → Payment (charge)
- Cart → Product (optional: validate product tồn tại / giá hiện tại khi add)
- Frontend → Gateway → Service

**Asynchronous (RabbitMQ):**

- Order (và/hoặc Payment) publish domain events
- Notification consume

Events: `ORDER_CREATED`, `ORDER_CONFIRMED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `ORDER_SHIPPED`, `ORDER_DELIVERED`.

## 6.9 Saga (orchestration đơn giản)

Không dùng distributed transaction.

```
Create Order
  → Check Inventory
  → Reserve Inventory
  → Payment
      ├─ SUCCESS → Confirm Order → Deduct stock
      └─ FAILED  → Release Inventory → Order PAYMENT_FAILED
```

Orchestrator: **Order Service**.

Compensation: release reserved stock; đánh dấu PAYMENT_FAILED.

Xem ADR-007.

## 6.10 Security (thiết kế — implement Phase 2)

- Spring Security + JWT + BCrypt.
- Roles: CUSTOMER, ADMIN.
- Customer không CRUD product; không xem cart/order người khác.
- Admin quản lý product và order.
- Secret qua environment variables.

## 6.11 Layered architecture trong mỗi service

```
controller → service → repository → database
```

DTO request/response. Entity không expose ra ngoài nếu không cần. Global exception handler + envelope API thống nhất.

## 6.12 Những gì Phase 1 chưa implement

Skeleton chỉ có application bootstrap, cấu hình, actuator. Business logic, JWT filter thật, Feign, consumer, schema JPA — thuộc Phase 2.

## 6.13 Phase 2 implementation notes

- JWT được validate **tại từng service** (resource server), không bắt buộc filter ở Gateway. Gateway vẫn là entry point routing + CORS.
- Module `common` chứa envelope API, JWT, `OrderEvent` — xem ADR-011. Không chia sẻ database.
- OpenFeign: Order → Cart/Product/Inventory/Payment; Cart → Product. URL cấu hình `clients.*.url` (local) hoặc Eureka khi `EUREKA_ENABLED=true`.
- RabbitMQ exchange `ecommerce.events`, queue `notification.events`, routing key `order.event`. Publish **after commit**.
- Schema JPA `ddl-auto: update` trên PostgreSQL logical DBs.
- Swagger UI: `http://localhost:<port>/swagger-ui.html` trên mỗi backend service (trừ Eureka/Gateway).

