# PHASE 2 REPORT

Date: 2026-09-05

## Services Completed

| Service | Status |
|---------|--------|
| Eureka Server | Registration server (enable client via `EUREKA_ENABLED=true`) |
| API Gateway | Routes `/api/auth`, `/api/admin/users`, products, cart, inventory, orders, payments + CORS |
| AUTH-SERVICE | Register, login, JWT, BCrypt, profile, admin users, seed admin/customer |
| PRODUCT-SERVICE | Product/category CRUD, search/filter/pagination, admin write, seed catalog |
| CART-SERVICE | Get/add/update/remove/clear; validate product via Feign |
| INVENTORY-SERVICE | Admin stock APIs + internal check/reserve/release/deduct; pessimistic lock |
| ORDER-SERVICE | Checkout saga, list/detail, cancel, admin status; Feign + Rabbit publisher |
| PAYMENT-SERVICE | Mock SUCCESS/FAILED, persist payments |
| NOTIFICATION-SERVICE | Rabbit consumer, DB persist, console/mock email log |
| `common` | API envelope, JWT, events (ADR-011) |

Frontend was **not** changed (Phase 3).

## APIs

Implemented per `docs/09-api-design.md`, plus internal:

- `/internal/inventory/*`
- `/internal/cart/{userId}`
- `/internal/payments`

Swagger: `{service}/swagger-ui.html`

## Database

PostgreSQL logical DBs (ADR-010): `auth_db`, `product_db`, `cart_db`, `inventory_db`, `order_db`, `payment_db`, `notification_db`. JPA `ddl-auto=update`. Seed: 1 admin, 1 customer, 4 categories, 11 products, inventory 50 each.

## Authentication

JWT issued by Auth Service; validated in each resource service. Roles CUSTOMER/ADMIN. Password never returned.

## RabbitMQ

Exchange `ecommerce.events`, queue `notification.events`, routing key `order.event`.

Events: `ORDER_CREATED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `ORDER_CONFIRMED` (+ `ORDER_SHIPPED`/`ORDER_DELIVERED` when admin updates status).

Publish after transaction commit. Consumer errors are logged only (BR-12).

`docker compose config` validated (RabbitMQ service). Full `docker compose up` of all Java services is Phase 4.

## Saga

Create order → check stock → persist PAYMENT_PENDING → reserve → mock payment:

- SUCCESS → deduct reserved → CONFIRMED → clear cart → events
- FAILED → release → PAYMENT_FAILED → event

## Tests

`mvn test` **BUILD SUCCESS** (Java 21 `C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot`).

Auth 5, Product 3, Cart 2, Inventory 5, Order 5, Payment 2, Notification 2, Eureka 1, Gateway 1 (plus context-load tests).

## Build

Maven reactor including `common` + 9 Spring modules: **SUCCESS**.

## Known Issues

1. Default `JAVA_HOME` on this machine is still Java 8; builds must point to JDK 21.
2. Eureka is **opt-in** (`EUREKA_ENABLED` default false) so local run works without discovery; Feign/Gateway use localhost URLs.
3. `/internal/**` is permitAll on the service process. Security relies on Gateway not exposing those paths. Not a production-hardening of mTLS.
4. Inventory seed uses productId 1–11 assuming product PK sequence starts at 1 (fresh DB). Re-seed mismatch if products were deleted/recreated.
5. Confirm-then-cancel uses `release` which returns quantity to `available` even after deduct (reserved may already be 0). Documented in inventory service.
6. Live PostgreSQL + RabbitMQ end-to-end process start was not run as a long-lived stack in this phase (unit/integration tests used H2 and mocked Feign/Rabbit). Start local DBs with existing `scripts/init-postgres.ps1` and `docker compose up rabbitmq` before demo.
7. Frontend still skeleton.

### Architecture decisions (not silent)

- **ADR-011** shared `common` JAR for JWT/envelope/events.
- JWT at services, not Gateway (documented in `docs/10-security.md`).
- PostgreSQL remains (ADR-010); did **not** revert to MySQL.

## Ready For Phase 3

**YES** — backend core is in place for UI integration. Do not start Phase 3 until explicitly requested.
