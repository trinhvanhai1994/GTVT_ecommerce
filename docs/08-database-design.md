# Chương 8 — Thiết kế cơ sở dữ liệu

## 8.1 Nguyên tắc

- **Database per service**: mỗi service sở hữu một logical database.
- Không foreign key xuyên service.
- Cross-service chỉ lưu ID (`userId`, `productId`, `orderId`).
- Một PostgreSQL instance (`localhost:5432`) host nhiều logical database.

Engine: **PostgreSQL 17** at `localhost:5432`, user `postgres`.

Logical databases:

`auth_db`, `product_db`, `cart_db`, `inventory_db`, `order_db`, `payment_db`, `notification_db`

Khởi tạo: `docker/init-postgres.sql` (Compose volume Postgres lần đầu).

ERD tổng: `docs/diagrams/erd.mmd` (các cụm độc lập, không FK xuyên cụm).

---

## 8.2 auth_db.users

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| email | VARCHAR(255) | | YES | NO | BR-01 |
| password_hash | VARCHAR(255) | | | NO | BCrypt, never returned |
| full_name | VARCHAR(255) | | | NO | |
| role | VARCHAR(32) | | | NO | CUSTOMER / ADMIN |
| status | VARCHAR(32) | | | NO | ACTIVE / INACTIVE |
| created_at | TIMESTAMP | | | NO | |
| updated_at | TIMESTAMP | | | NO | |

Indexes: `uk_users_email (email)`, `idx_users_role (role)`

---

## 8.3 product_db.categories

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| name | VARCHAR(128) | | YES | NO | |
| description | VARCHAR(512) | | | YES | |
| created_at | TIMESTAMP | | | NO | |
| updated_at | TIMESTAMP | | | NO | |

## 8.4 product_db.products

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| name | VARCHAR(255) | | | NO | |
| description | TEXT | | | YES | |
| price | DECIMAL(12,2) | | | NO | > 0 |
| category_id | BIGINT | | | NO | FK **trong** product_db → categories.id |
| brand | VARCHAR(128) | | | YES | |
| image_url | VARCHAR(512) | | | YES | |
| status | VARCHAR(32) | | | NO | ACTIVE / INACTIVE |
| created_at | TIMESTAMP | | | NO | |
| updated_at | TIMESTAMP | | | NO | |

Indexes: `idx_products_category (category_id)`, `idx_products_name (name)`, `idx_products_status (status)`, `idx_products_brand (brand)`

Relationship nội bộ: `products.category_id` → `categories.id`

---

## 8.5 cart_db.carts

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| user_id | BIGINT | | YES | NO | Auth user id, **no FK** |
| created_at | TIMESTAMP | | | NO | |
| updated_at | TIMESTAMP | | | NO | |

Một customer một cart active (unique `user_id`).

## 8.6 cart_db.cart_items

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| cart_id | BIGINT | | | NO | FK → carts.id |
| product_id | BIGINT | | | NO | Product id, **no FK** |
| quantity | INT | | | NO | > 0 |
| created_at | TIMESTAMP | | | NO | |
| updated_at | TIMESTAMP | | | NO | |

Unique: `(cart_id, product_id)`

---

## 8.7 inventory_db.inventories

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| product_id | BIGINT | | YES | NO | Product id, **no FK** |
| available_quantity | INT | | | NO | >= 0 |
| reserved_quantity | INT | | | NO | >= 0 |
| updated_at | TIMESTAMP | | | NO | |

Invariant: `available_quantity >= 0`, `reserved_quantity >= 0`.

---

## 8.8 order_db.orders

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| user_id | BIGINT | | | NO | Auth user id, **no FK** |
| status | VARCHAR(32) | | | NO | See status list |
| total_amount | DECIMAL(12,2) | | | NO | |
| shipping_name | VARCHAR(255) | | | NO | |
| shipping_phone | VARCHAR(32) | | | NO | |
| shipping_address | VARCHAR(512) | | | NO | |
| payment_method | VARCHAR(32) | | | YES | |
| created_at | TIMESTAMP | | | NO | |
| updated_at | TIMESTAMP | | | NO | |

Indexes: `idx_orders_user (user_id)`, `idx_orders_status (status)`

Status: PENDING, PAYMENT_PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, PAYMENT_FAILED

## 8.9 order_db.order_items

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| order_id | BIGINT | | | NO | FK → orders.id |
| product_id | BIGINT | | | NO | Snapshot ref, **no FK** |
| product_name | VARCHAR(255) | | | NO | Snapshot BR-10 |
| quantity | INT | | | NO | |
| unit_price | DECIMAL(12,2) | | | NO | Snapshot |
| subtotal | DECIMAL(12,2) | | | NO | quantity * unit_price |

---

## 8.10 payment_db.payments

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| order_id | BIGINT | | | NO | Order id, **no FK** |
| user_id | BIGINT | | | NO | |
| amount | DECIMAL(12,2) | | | NO | |
| method | VARCHAR(32) | | | NO | COD / MOCK_CARD / MOCK_BANKING |
| status | VARCHAR(32) | | | NO | PENDING / SUCCESS / FAILED / REFUNDED |
| failure_reason | VARCHAR(255) | | | YES | |
| created_at | TIMESTAMP | | | NO | |
| updated_at | TIMESTAMP | | | NO | |

Indexes: `idx_payments_order (order_id)`, `idx_payments_status (status)`

---

## 8.11 notification_db.notifications

| Column | Type | PK | Unique | Null | Notes |
|--------|------|----|--------|------|-------|
| id | BIGSERIAL | YES | | NO | |
| event_type | VARCHAR(64) | | | NO | ORDER_CREATED, … |
| user_id | BIGINT | | | YES | |
| reference_id | VARCHAR(64) | | | YES | orderId / paymentId |
| title | VARCHAR(255) | | | NO | |
| message | VARCHAR(1024) | | | NO | |
| channel | VARCHAR(32) | | | NO | CONSOLE / MOCK_EMAIL / DB |
| status | VARCHAR(32) | | | NO | SENT / FAILED |
| created_at | TIMESTAMP | | | NO | |

Index: `idx_notifications_user (user_id)`, `idx_notifications_event (event_type)`

---

## 8.12 Seed data (thiết kế — nạp ở Phase 2/3)

Admin: `admin@example.com` / `Password123`  
Customer: `customer@example.com` / `Password123`  
Categories: Smartphone, Laptop, Headphone, Accessories  
11 products seeded + inventory `availableQuantity=50` cho productId 1..11.

Seeder chạy khi profile không phải `test`.


---

## 8.13 Những gì không làm

- Không shared schema.
- Không FK `orders.user_id → auth_db.users.id`.
- Không lưu `available_quantity` trên bảng `products`.
