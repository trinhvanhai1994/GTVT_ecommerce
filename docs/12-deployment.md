# Chương 12 — Deployment

## Local (recommended for demo)

1. PostgreSQL 17 `localhost:5432` user `postgres` / `123456`
2. `powershell -File scripts\init-postgres.ps1`
3. `docker compose up -d rabbitmq`
4. `powershell -File scripts\start-local.ps1` (builds jars and starts services)
5. `cd frontend && npm install && npm run dev` → http://localhost:5173 (proxies `/api` to Gateway `:8080`)

JDK 21: `C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot`

## Docker Compose (full stack)

Java images need jars in `*/target/*.jar` first (`mvn -DskipTests package`).

Containers talk to **host PostgreSQL** via `host.docker.internal`. RabbitMQ runs in Compose.

```
docker compose build
docker compose up -d
```

Frontend: http://localhost:5173 (nginx → gateway `/api`)  
Gateway: http://localhost:8080  
RabbitMQ UI: http://localhost:15672 (`ecommerce` / `ecommerce`)  
Eureka: http://localhost:8761 (optional; clients default `EUREKA_ENABLED=false`)

## Health

- Gateway `GET http://localhost:8080/actuator/health`
- Each service `GET http://localhost:<port>/actuator/health`

## Environment

See `.env.example`. Do not commit `.env`.
