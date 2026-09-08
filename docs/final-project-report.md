# FINAL PROJECT REPORT

## 1. Project Overview
Single-store e-commerce on Spring Boot 3 / Spring Cloud / React. Package `gtvt.haitv.ecommerce`. Mock payment. PostgreSQL per-service logical DBs. RabbitMQ notifications.

## 2. Architecture
Frontend → API Gateway → Auth, Product, Cart, Inventory, Order, Payment. Order orchestrates Saga. Events to RabbitMQ → Notification. Eureka available, default off locally.

## 3. Services
eureka-server, gateway, auth, product, cart, inventory, order, payment, notification, frontend, common JAR.

## 4. Database
auth_db, product_db, cart_db, inventory_db, order_db, payment_db, notification_db on local PostgreSQL 17 (ADR-010).

## 5. API
Contract in docs/09-api-design.md. Gateway routes `/api/**`. Internal APIs not on Gateway.

## 6. Security
JWT + BCrypt + CUSTOMER/ADMIN. Ownership checks. Secrets from env.

## 7. RabbitMQ
ecommerce.events / notification.events. Publish after commit.

## 8. Saga
Reserve → pay → deduct/confirm or release / PAYMENT_FAILED.

## 9. Frontend
React storefront and admin at :5173, proxied to Gateway.

## 10. Testing
Unit/API tests `mvn test` passed. Live E2E via Gateway: GOLDEN_PATH=PASS, FAILURE_PATH=PASS (inventory 50→49 then compensated).

## 11. Docker
compose: rabbitmq + all app images + frontend nginx. Apps use host Postgres. `docker compose config` validated. Full image build/up of every container was not the vehicle for the live path; local JARs were.

## 12. Documentation
docs/01–14, ADRs, diagrams (including class.mmd), demo, defense-questions, final-review, Postman, README.

## 13. Demo
docs/13-demo.md / docs/demo.md. Accounts admin@ / customer@ / customer2@ Password123.

## 14. Known Limitations
Mock payment; Eureka opt-in; internal APIs trust network; no browser-automation UI pass; Docker full-stack run not used for the recorded E2E.

## 15. Future Improvements
Outbox, gateway JWT, dedicated Postgres container, observability.

## 16. Final Status

**READY FOR SUBMISSION**

Acceptance actually verified:
- Backend + Gateway processes healthy
- Golden Path CONFIRMED + stock decrement
- Failure Path PAYMENT_FAILED + stock compensation
- Maven tests green
- Frontend production build green

Not verified in a real browser click-through (no browser automation in this session). UI source and build exist; storefront must still be clicked in defense rehearsal.
