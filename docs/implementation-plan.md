# Implementation Plan

Plan toàn cục. **Phase 1 chỉ làm nền tảng.** Phase 2–4 chưa được phép implement cho đến khi user yêu cầu rõ.

---

## Phase 1 — Foundation (hiện tại)

- [x] Inspect repository + `current-state.md`
- [x] Introduction, business analysis, requirements
- [x] Actors, FR, NFR, business rules
- [x] Use cases + diagram + specification
- [x] BPMN (login, product, cart, checkout, payment, fulfillment)
- [x] Architecture + microservices
- [x] Diagrams: context, architecture, deployment, ERD, sequences
- [x] Database design
- [x] API design
- [x] ADRs + traceability
- [x] Project skeleton
- [x] docker-compose (RabbitMQ; PostgreSQL local tại localhost:5432)
- [x] Postman structure
- [x] Build skeleton (Maven test + frontend Vite build — 2026-09-05)

Không làm ở Phase 1: JWT thật, CRUD, Saga code, frontend pages, seed data runtime, full Docker e2e.

---

## Phase 2 — Core backend (chưa làm)

Chỉ bắt đầu khi user nói `IMPLEMENT PHASE 2` / `START PHASE 2`.

1. Eureka + Gateway + Docker infra.
2. Auth: register/login/JWT/BCrypt/profile + tests.
3. Product + category CRUD, search, pagination, ADMIN authz.
4. Cart CRUD + ownership.
5. Inventory check/reserve/release/deduct + no negative stock.
6. Order create/list/detail/cancel + Feign Inventory/Payment.
7. Mock payment SUCCESS/FAILED.
8. RabbitMQ producer/consumer + notification persist.
9. Saga + compensation.
10. Swagger, security, unit tests.
11. Cập nhật docs 06, 08, 09, 10, 11, ADR.

---

## Phase 3 — Frontend + E2E (chưa làm)

Chỉ khi user yêu cầu Phase 3.

- React pages customer + admin
- JWT, protected/role routes
- Gọi qua Gateway
- Golden path + failure path demo
- Seed data

---

## Phase 4 — Testing, Docker, tài liệu nộp (chưa làm)

Chỉ khi user yêu cầu Phase 4.

- Full test ≥ 30 cases, Postman hoàn chỉnh
- Docker compose toàn hệ thống
- Docs 10–14, defense, demo, README cuối, final review

---

## Thứ tự phụ thuộc kỹ thuật

```
Eureka
  → Gateway
  → Auth
  → Product + Inventory
  → Cart
  → Payment
  → Order (Saga)
  → Notification
  → Frontend
```

## Rủi ro đã biết

| Risk | Phase xử lý |
|------|-------------|
| JDK mặc định là 8, project cần 21 | Phase 1 build / README |
| Saga lệch inventory nếu crash giữa chừng | Phase 2: idempotent reserve/release |
| Cart giá lệch product | Phase 2: snapshot lúc order, không lúc cart |
