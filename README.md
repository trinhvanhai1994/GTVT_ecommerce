# GTVT E-Commerce

Spring Boot 3 + Spring Cloud microservices (`gtvt.haitv.ecommerce`) with React storefront.

Frontend → **API Gateway :8080** → Auth / Product / Cart / Inventory / Order / Payment. Notification consumes RabbitMQ.

## Architecture

See `docs/06-architecture.md` and `docs/diagrams/architecture.mmd`.

## Services

| Service | Port | Database |
|---------|------|----------|
| eureka-server | 8761 | — |
| admin-server | 8088 | Spring Boot Admin + Flow logs UI |
| gateway | 8080 | — |
| auth-service | 8081 | auth_db |
| product-service | 8082 | product_db |
| cart-service | 8083 | cart_db |
| inventory-service | 8084 | inventory_db |
| order-service | 8085 | order_db |
| payment-service | 8086 | payment_db |
| notification-service | 8087 | notification_db |
| frontend | 5173 | — |
| frontend-bicycle | 5174 | VOLTRA e-bike storefront |

## Requirements

- JDK 21 (`C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot`)
- Maven 3.9
- Node 22 / npm
- PostgreSQL 17 `localhost:5432` `postgres` / `123456`
- Docker (RabbitMQ; optional full compose)

## Installation / Run

```bat
powershell -File scripts\init-postgres.ps1
docker compose up -d rabbitmq
powershell -File scripts\start-local.ps1
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Xem flow logs

Mở **http://localhost:8088/flow** — hub gom log `start` / bước / `end` / `HTTP` của Gateway và mọi service (tự refresh 3s).

Spring Boot Admin (instances, logfile đầy đủ): **http://localhost:8088**

1. Restart backend:

```bat
powershell -File scripts\start-local.ps1
```

2. Gọi API qua Gateway `http://localhost:8080` (login, xem sản phẩm, checkout…).

3. Xem trên `/flow`, hoặc file `logs/*.log`, hoặc:

```bat
powershell -File scripts\watch-logs.ps1
powershell -File scripts\watch-logs.ps1 -Service ORDER-SERVICE
```

Tìm theo `cid` (8 ký tự) hoặc chữ `start checkout` / `end checkout`.

## Environment

Copy `.env.example`. JWT, DB, RabbitMQ via env. Do not commit `.env`.

## Test

```bat
set JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot
mvn test
powershell -File scripts\e2e-verify.ps1
```

## Swagger

`http://localhost:8081/swagger-ui.html` (auth) and similarly 8082–8087.

## Demo accounts

- admin@example.com / Password123
- customer@example.com / Password123
- customer2@example.com / Password123

## Demo scenario

`docs/13-demo.md` — Golden Path (payment success + stock deduct) and Failure Path (PAYMENT_FAILED + release).

## Postman

`postman/ecommerce.postman_collection.json` — baseUrl `http://localhost:8080`.

## Troubleshooting

- Java 8 on PATH: set JAVA_HOME to JDK 21.
- Gateway 401: login again, paste Bearer token.
- Empty catalog: wait for product-service seeder; use fresh product_db.
- RabbitMQ connection: `docker compose up -d rabbitmq`.
- Inventory not found: admin PUT `/api/inventory/{productId}`.
