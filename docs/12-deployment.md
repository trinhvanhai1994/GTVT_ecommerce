# Chương 12 — Deployment

## Local (Docker Compose)

Cần Docker Desktop. Giải phóng cổng `:5432` nếu Postgres local đang chiếm.

Engine duy nhất: `scripts/ops-deploy.sh` (wrapper: `deploy.sh` / `deploy.ps1`).

```bash
./scripts/ops-deploy.sh full
```

1. File lock — một job deploy tại một thời điểm.
2. Gỡ container trùng tên nếu thuộc project Compose khác.
3. `mvn -DskipTests package` trong container Maven (cache `gtvt-ecommerce-m2`).
4. `docker compose up -d --build` — Postgres, RabbitMQ, Eureka, Admin, microservices, Gateway, Frontend, Ops API/UI.

| Trường hợp | Lệnh |
|------------|------|
| Đổi Java / pom (full) | `./scripts/ops-deploy.sh full` |
| Chỉ rebuild image, JAR đã có | `./scripts/ops-deploy.sh full --skip-maven` |
| Container stop, không đổi code | `./scripts/ops-deploy.sh full --restart-only` |
| Restart 1 service (không build) | `./scripts/ops-deploy.sh restart --service auth` |
| Rebuild 1 service | `./scripts/ops-deploy.sh rebuild --service auth` |
| Maven module + rebuild 1 service | `./scripts/ops-deploy.sh maven-rebuild --service order` |

Reset DB: `docker compose down -v` rồi `./scripts/ops-deploy.sh full`.

| | URL |
|--|-----|
| Frontend | http://localhost:5173 |
| Gateway | http://localhost:8080 |
| Ops Console | http://localhost:5199 (`admin` / `abc123`) |
| Ops API | http://localhost:8099 |
| Eureka | http://localhost:8761 |
| Spring Boot Admin | http://localhost:8088 |
| RabbitMQ UI | http://localhost:15672 (`ecommerce` / `ecommerce`) |
| Postgres | `localhost:5432` (`postgres` / `123456`) |

Service-to-service: Feign URL `http://<service>:<port>` trong Compose. Eureka đăng ký instance; Gateway route URI tĩnh.

Init DB: `docker/init-postgres.sql` (chỉ khi volume Postgres trống).

## Ops Console

Website quản lý riêng (`ops-console` + `ops-control-plane`): status, logs, restart/deploy từng service hoặc cả stack. Không có `docker compose down -v` trên UI.

## Health

- Gateway `GET http://localhost:8080/actuator/health`
- Ops `GET http://localhost:8099/actuator/health`
- `docker compose ps`

## Environment

`.env.example`. Không commit `.env`. Tuỳ chọn `OPS_USER` / `OPS_PASSWORD`.
