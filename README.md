# GTVT E-Commerce

Cửa hàng trực tuyến (Spring Boot 3 + Spring Cloud + React). Khách chỉ nói chuyện với **một cửa**: API Gateway `:8080`. Các microservice phía sau tự chia việc — mỗi service một database, Order điều phối checkout, Notification nhận sự kiện qua RabbitMQ.

Chi tiết kỹ thuật: `docs/06-architecture.md`.  
Luồng chạy Spring Cloud + map config (SA): `docs/15-spring-cloud-luong-chay-va-config.md`.  
Deploy: `docs/12-deployment.md`.

## Hệ thống hoạt động như thế nào

1. **Browser không gọi từng service.** React (`:5173`) chỉ gọi Gateway. Gateway route `/api/auth`, `/api/products`, `/api/cart`, `/api/orders`, …
2. **Mỗi miền một service + một DB.** Auth không đọc `order_db`; Order không ghi `product_db`. Giao tiếp bằng REST (OpenFeign) hoặc event, không share bảng.
3. **Checkout là Saga do Order cầm.** Order lần lượt: lấy giỏ → kiểm/giữ kho → thanh toán mock. Thành công thì trừ kho + xóa giỏ; thất bại thì nhả kho.
4. **Email không nằm trong giao dịch đặt hàng.** Order publish event lên RabbitMQ; Notification consume rồi ghi log.
5. **Eureka** để service đăng ký. **Admin `:8088/flow`** để xem log từng bước theo `cid`.

## Sơ đồ tổng quan

```mermaid
flowchart TB
  subgraph NguoiDung["Người dùng"]
    KH[Khách / Admin]
  end

  subgraph UI["Cửa hàng"]
    FE["React Frontend :5173"]
  end

  subgraph Cong["Cổng duy nhất"]
    GW["API Gateway :8080"]
  end

  subgraph NghiepVu["Microservices"]
    AUTH["Auth :8081<br/>đăng nhập, JWT"]
    PROD["Product :8082<br/>catalog"]
    CART["Cart :8083<br/>giỏ hàng"]
    INV["Inventory :8084<br/>tồn kho"]
    ORD["Order :8085<br/>điều phối checkout"]
    PAY["Payment :8086<br/>thanh toán mock"]
    NOTI["Notification :8087<br/>email mock"]
  end

  subgraph HaTang["Hạ tầng"]
    EU["Eureka :8761"]
    MQ["RabbitMQ :5672"]
    PG[("PostgreSQL — 7 logical DB")]
    ADM["Admin / Flow logs :8088"]
  end

  KH --> FE
  FE -->|"HTTP + JWT"| GW
  GW --> AUTH & PROD & CART & INV & ORD & PAY

  ORD -->|"REST: check / reserve / deduct / release"| INV
  ORD -->|"REST: charge"| PAY
  CART -->|"REST: validate SP"| PROD
  ORD -->|"event sau commit"| MQ
  MQ --> NOTI

  AUTH & PROD & CART & INV & ORD & PAY & NOTI & GW -.-> EU
  AUTH & PROD & CART & INV & ORD & PAY & NOTI --> PG
  ADM -.->|đọc health / log| GW & ORD
```

**Đọc sơ đồ:** mũi tên liền = request đồng bộ (chờ trả lời). Mũi tên nét đứt tới Eureka = đăng ký / discovery. Order → RabbitMQ = bất đồng bộ (checkout đã xong mới gửi mail).

## Flow nghiệp vụ

### 1. Đăng nhập

```mermaid
sequenceDiagram
  actor U as Khách
  participant FE as Frontend
  participant GW as Gateway
  participant AUTH as Auth
  U->>FE: email + mật khẩu
  FE->>GW: POST /api/auth/login
  GW->>AUTH: chuyển tiếp
  AUTH->>AUTH: BCrypt + phát JWT
  AUTH-->>FE: token + role
  FE-->>U: lưu JWT, vào app
```

Mọi API sau đó gửi `Authorization: Bearer <JWT>`. Role `CUSTOMER` mua hàng; `ADMIN` quản lý catalog / kho / đơn.

### 2. Xem sản phẩm và thêm giỏ

```mermaid
sequenceDiagram
  actor U as Khách
  participant FE as Frontend
  participant GW as Gateway
  participant PROD as Product
  participant CART as Cart
  U->>FE: xem catalog / chi tiết
  FE->>GW: GET /api/products
  GW->>PROD: catalog
  PROD-->>FE: danh sách SP
  U->>FE: Add to cart
  FE->>GW: POST /api/cart
  GW->>CART: thêm dòng
  CART->>PROD: kiểm SP còn / giá
  CART-->>FE: giỏ cập nhật
```

### 3. Checkout — hai nhánh

Order Service là **orchestrator**. Payment là mock: mặc định SUCCESS; tick “Simulate payment failure” trên UI để đi nhánh thất bại.

```mermaid
flowchart TD
  A[Khách bấm Checkout] --> B[Gateway POST /api/orders]
  B --> C[Order tạo đơn PENDING từ giỏ]
  C --> D{Kho đủ?}
  D -->|Không| X[Hủy / báo hết hàng]
  D -->|Có| E[Reserve tồn kho]
  E --> F[Đơn PAYMENT_PENDING]
  F --> G[Order gọi Payment charge]
  G --> H{Kết quả thanh toán}
  H -->|SUCCESS| I[Deduct kho]
  I --> J[Đơn CONFIRMED + xóa giỏ]
  J --> K[Publish PAYMENT_SUCCESS / ORDER_CONFIRMED]
  K --> L[Notification mock email]
  H -->|FAILED| M[Release kho đã reserve]
  M --> N[Đơn PAYMENT_FAILED]
  N --> O[Publish PAYMENT_FAILED]
  O --> L
```

| | Golden Path | Failure Path |
|---|---|---|
| UI | Checkout, **không** tick fail | Tick **Simulate payment failure** |
| Đơn | `CONFIRMED` | `PAYMENT_FAILED` |
| Kho | `available` giảm (deduct) | `available` trở lại (release) |
| Mail | log success | log payment failed |

Notification **không rollback** đơn: event gửi sau khi Order đã commit.

## Services

| Service | Port | Database | Việc chính |
|---------|------|----------|------------|
| postgres | 5432 | 7 logical DB | Dữ liệu (volume `postgres-data`) |
| rabbitmq | 5672 / 15672 | — | Event Order → Notification |
| eureka-server | 8761 | — | Service discovery |
| admin-server | 8088 | — | Spring Boot Admin + UI `/flow` |
| gateway | 8080 | — | Entry point, CORS, route `/api/**` |
| auth-service | 8081 | auth_db | Login, JWT, user/role |
| product-service | 8082 | product_db | Catalog |
| cart-service | 8083 | cart_db | Giỏ theo user |
| inventory-service | 8084 | inventory_db | Check / reserve / deduct / release |
| order-service | 8085 | order_db | Tạo đơn, cầm Saga |
| payment-service | 8086 | payment_db | Charge mock SUCCESS/FAILED |
| notification-service | 8087 | notification_db | Consume RabbitMQ |
| frontend | 5173 | — | Storefront (nginx → Gateway `/api`) |

## Chạy local (Docker Compose)

Cần **Docker Desktop** đang chạy. Tắt PostgreSQL cài trên Windows nếu đang chiếm cổng **5432**.

### 1. Lên toàn bộ stack

Trong thư mục gốc repo:

```bat
powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
```

Lệnh này:

1. Gỡ container trùng tên nếu chúng thuộc project Compose **khác** (tránh Conflict `ecommerce-rabbitmq`).
2. Build JAR **một lần** trong container Maven (`mvn -DskipTests package`, cache volume `gtvt-ecommerce-m2`).
3. `docker compose up -d --build` — Postgres (7 DB), RabbitMQ, Eureka, Admin, 7 microservice, Gateway, Frontend.

Lần đầu mất vài phút (kéo image + Maven). Lần sau cùng lệnh: data Postgres/RabbitMQ **giữ nguyên** (volume). Init DB (`docker/init-postgres.sql`) chỉ chạy khi volume Postgres còn trống.

Tương đương từng bước (nếu không dùng script):

```bat
docker compose up -d --build
```

(Cần JAR trong `*/target/*-SNAPSHOT.jar` trước — script đã lo bước Maven.)

Đợi container `healthy` / `started`: `docker compose ps`

### 2. Mở ứng dụng

| | URL | Tài khoản |
|--|-----|-----------|
| Storefront | http://localhost:5173 | customer@example.com / Password123 |
| Gateway API | http://localhost:8080 | Bearer JWT sau login |
| Flow logs | http://localhost:8088/flow | — |
| Spring Boot Admin | http://localhost:8088 | admin / admin |
| Eureka | http://localhost:8761 | — |
| RabbitMQ UI | http://localhost:15672 | ecommerce / ecommerce |
| Postgres | localhost:5432 | postgres / 123456 |
| Swagger (từng service) | http://localhost:8081/swagger-ui.html … `:8087` | — |

Admin UI: admin@example.com / Password123. User phụ: customer2@example.com / Password123.

Hub `/flow` gọi logfile **trong mạng Docker** (`http://gateway:8080`, `http://auth:8081`, …), không dùng `localhost` từ container Admin.

### 3. Lệnh hàng ngày

| Việc | Lệnh |
|------|------|
| Đổi code Java / pom | `scripts\deploy.ps1` |
| JAR đã build, chỉ đóng image lại | `scripts\deploy.ps1 -SkipMaven` |
| Container bị stop, không đổi code | `scripts\deploy.ps1 -RestartOnly` hoặc `docker compose start` |
| Xem log một service | `docker compose logs -f order` (đổi `order` / `gateway` / `auth` / …) |
| Trạng thái | `docker compose ps` |
| Dừng stack (giữ DB) | `docker compose stop` |
| Xóa container, **giữ** volume DB | `docker compose down` |
| Xóa sạch DB + RabbitMQ data | `docker compose down -v` rồi `scripts\deploy.ps1` |

Health Gateway: `GET http://localhost:8080/actuator/health`  
E2E: `powershell -File scripts\e2e-verify.ps1`

### 4. Cấu hình

Copy `.env.example` → `.env` nếu đổi mật khẩu DB / JWT / RabbitMQ. Không commit `.env`. Compose đọc file này khi `up`.

Mạng nội bộ: Feign và Admin dùng hostname Compose (`postgres`, `rabbitmq`, `eureka`, `auth`, `gateway`, `admin`, …).

Chi tiết kỹ thuật: `docs/12-deployment.md`. Demo checkout: `docs/13-demo.md`. Postman: `postman/ecommerce.postman_collection.json` (`baseUrl` `http://localhost:8080`).

### 5. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Port 5432 already allocated | Dừng PostgreSQL Windows, chạy lại `deploy.ps1` |
| Conflict container name | `scripts\deploy.ps1` (gỡ leftover project khác). Không `down -v` trừ khi muốn xóa DB |
| `/flow` Connection refused `localhost:808x` | Image Admin cũ — `deploy.ps1` để lấy URL `http://gateway:8080` |
| Log `localhost:8088` Connection refused | Image service cũ — rebuild để Admin client trỏ `http://admin:8088` |
| Gateway 401 | Login lại, header `Authorization: Bearer` |
| Catalog trống | Đợi seeder product; hoặc `docker compose down -v` rồi deploy lại |
| Inventory not found | Admin PUT `/api/inventory/{productId}` |
