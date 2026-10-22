# 6. Biểu đồ thiết kế

## 6.1 Hình 2.1 — System Context

```mermaid
flowchart LR
  Customer((Customer))
  Seller((Seller))
  Admin((Platform_Admin))
  System[Marketplace_System]
  Pay[Mock_Payment]
  Mail[Notification_Log]

  Customer -->|Mua_trong_shop| System
  Seller -->|Dang_ky_va_ban| System
  Admin -->|Duyet_shop| System
  System -->|Charge| Pay
  Pay -->|SUCCESS_FAILED| System
  System -->|Thong_bao| Mail
```

## 6.2 Hình 3.1 — Use Case

```mermaid
flowchart LR
  C((Customer))
  S((Seller))
  A((Platform_Admin))
  P((Payment))
  N((Notification))

  C --> UC1[Dang_ky_Dang_nhap]
  C --> UC2[Xem_list_shop_Home]
  C --> UC3[Vao_shop_list_SP]
  C --> UC4[Chon_SP_them_gio]
  C --> UC5[Checkout]
  C --> UC6[Xem_huy_don]
  S --> UC1
  S --> UC7[Dang_ky_shop]
  S --> UC8[Kenh_nguoi_ban_CRUD]
  S --> UC9[Xu_ly_don_shop]
  A --> UC1
  A --> UC10[Duyet_khoa_shop]
  A --> UC11[Giam_sat_don_san]
  P --> UC5
  N --> UC12[Gui_thong_bao]
  UC5 --> UC12
  UC7 --> UC10
```

## 6.3 Deployment

**Dev (MVP hiện tại)**

- Frontend `:5173`
- Gateway `:8080`, Eureka `:8761`
- auth `:8081`, product `:8082`, cart `:8083`, inventory `:8084`, order `:8085`, payment `:8086`, notification `:8087`, **shop `:8089`** (admin-server giữ `:8088`)
- PostgreSQL `:5432`, RabbitMQ `:5672`
- Engine: `scripts/ops-deploy.sh` (Maven trong container + `docker compose up`)

**Production (định hướng — mục 5.7)**

- Storefront: build static (Vite) + CDN/reverse proxy; API chỉ qua Gateway (HTTPS).
- Microservice: orchestrator (K8s/ECS), **rolling deploy**, secret qua vault/env; **không** `ddl-auto: update` trên prod.
- Data: Postgres/RabbitMQ managed, backup có kiểm thử restore; correlation id + trace/metric tập trung.

## 6.4 Hình 5.1 — Sequence đăng ký & duyệt shop

```mermaid
sequenceDiagram
  actor Seller
  participant FE as Storefront
  participant GW as api_gateway
  participant SHOP as shop_service
  participant AUTH as auth_service
  actor Admin as Platform_Admin

  Seller->>FE: Submit_ho_so_shop
  FE->>GW: POST_api_shops
  GW->>SHOP: Tao_PENDING_va_OWNER
  SHOP->>AUTH: Cap_role_SELLER
  SHOP-->>FE: Shop_PENDING
  Admin->>GW: PATCH_approve
  GW->>SHOP: status_APPROVED
  SHOP->>AUTH: shop_approved_provision
  AUTH->>AUTH: temp_password_mustChangePassword
  AUTH-->>SHOP: ok
  Note over AUTH: Email template to contactEmail
  SHOP-->>FE: ShopResponse
```

## 6.5 Hình 5.2 — Sequence Checkout + Saga (một Order / shop)

```mermaid
sequenceDiagram
  actor User
  participant ORD as order_service
  participant INV as inventory_service
  participant PAY as payment_service
  participant MQ as RabbitMQ

  User->>ORD: POST_api_orders_checkout
  Note over ORD: Group_cart_theo_shopId
  loop Moi_shop
    ORD->>INV: check_reserve
    ORD->>PAY: charge
    alt SUCCESS
      PAY-->>ORD: SUCCESS
      ORD->>INV: deduct
      ORD->>MQ: ORDER_CONFIRMED
    else FAILED
      PAY-->>ORD: FAILED
      ORD->>INV: release
      ORD->>MQ: PAYMENT_FAILED
    end
  end
```

## 6.6 Hình 6.1 — ERD (Entity Relationship Diagram) logic — tổng quan

```mermaid
erDiagram
  users {
    BIGINT id PK
    VARCHAR role
  }
  shops {
    BIGINT id PK
    BIGINT owner_user_id
    VARCHAR slug
    VARCHAR status
  }
  shop_members {
    BIGINT id PK
    BIGINT shop_id
    BIGINT user_id
  }
  categories {
    BIGINT id PK
    BIGINT shop_id
  }
  products {
    BIGINT id PK
    BIGINT shop_id
    BIGINT category_id
  }
  carts {
    BIGINT id PK
  }
  cart_items {
    BIGINT id PK
    BIGINT shop_id
    BIGINT product_id
  }
  inventories {
    BIGINT id PK
    BIGINT product_id
  }
  orders {
    BIGINT id PK
    BIGINT shop_id
    VARCHAR shop_name
  }
  order_items {
    BIGINT id PK
  }
  payments {
    BIGINT id PK
  }
  notifications {
    BIGINT id PK
  }
  shops ||--o{ shop_members : shop_db
  categories ||--o{ products : product_db
  carts ||--o{ cart_items : cart_db
  orders ||--o{ order_items : order_db
```

**Đọc hình:** `shop_id` trên product/cart/order là **logical ID** — không FK sang `shop_db`. FK chỉ nội bộ từng Logical database.

---
