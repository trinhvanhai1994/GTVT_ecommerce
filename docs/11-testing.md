# Chương 11 — Kiểm thử (Phase 2)

## 11.1 Công cụ

JUnit 5, Mockito, Spring Boot Test, MockMvc, H2 (profile `test`). RabbitMQ auto-config bị loại khỏi test context.

## 11.2 Coverage Phase 2

| Area | Tests |
|------|--------|
| Auth | Register, duplicate email, login, wrong password, unauthorized profile |
| Product | CRUD, search, not found, CUSTOMER forbidden on create |
| Cart | Add, update, remove, clear (ProductClient mocked) |
| Inventory | Enough / not enough stock, reserve, release |
| Order | Checkout success, empty cart, out of stock, payment failed compensation |
| Payment | Mock SUCCESS / FAILED |
| Notification | Persist consumed event |
| Eureka / Gateway | Context load |

## 11.3 Chạy test

```
JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot
mvn test
```

## 11.4 Phase 3/4

- `scripts/e2e-verify.ps1` — Golden Path + Failure Path qua Gateway.
- Frontend `npm run build`.
- `docker compose config` validated.
- Additional Order cancel unit test.

Formal IDs: TC-AUTH-001..005, TC-PROD-001..005, TC-CART-001..004, TC-INV-001..004, TC-ORDER-001..004, TC-PAY-001..002, TC-NOTI-001, plus E2E-GOLDEN / E2E-FAIL.
