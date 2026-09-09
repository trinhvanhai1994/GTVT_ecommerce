# Chương 12 — Deployment

## Local (Docker Compose)

Cần Docker Desktop. Tắt PostgreSQL trên Windows nếu chiếm `:5432`.

```bat
powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
```

1. Gỡ container trùng tên nếu thuộc project Compose khác.
2. `mvn -DskipTests package` **một lần** trong container Maven (cache volume `gtvt-ecommerce-m2`).
3. `docker compose up -d --build` — Postgres (7 DB), RabbitMQ, Eureka, Admin, 7 service, Gateway, Frontend.

Lần sau **cùng lệnh**. Volume Postgres/RabbitMQ giữ data.

| Trường hợp | Lệnh |
|------------|------|
| Đổi Java / pom | `scripts\deploy.ps1` |
| Chỉ đổi Dockerfile/image, JAR đã build | `scripts\deploy.ps1 -SkipMaven` |
| Container stop, không đổi code | `scripts\deploy.ps1 -RestartOnly` |

Reset DB: `docker compose down -v` rồi `scripts\deploy.ps1`.

| | URL |
|--|-----|
| Frontend | http://localhost:5173 |
| Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| Admin / flow | http://localhost:8088/flow |
| RabbitMQ UI | http://localhost:15672 (`ecommerce` / `ecommerce`) |
| Postgres | `localhost:5432` (`postgres` / `123456`) |

Service-to-service: Feign URL `http://<service>:<port>` trong Compose. Eureka đăng ký instance; Gateway route URI tĩnh.

Init DB: `docker/init-postgres.sql` (chỉ khi volume Postgres trống).

## Health

- Gateway `GET http://localhost:8080/actuator/health`
- `docker compose ps`

## Environment

`.env.example`. Không commit `.env`.
