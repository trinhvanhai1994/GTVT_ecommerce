# Chương 9 — Thiết kế API

## 9.1 Convention

Base URL (qua Gateway): `http://localhost:8080`

Envelope success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Envelope error:

```json
{
  "success": false,
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "timestamp": "2026-09-05T10:00:00Z"
}
```

HTTP: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.

Auth header: `Authorization: Bearer <jwt>`

Không expose JPA entity trực tiếp.

---

## 9.2 Authentication — AUTH-SERVICE

### POST /api/auth/register

Auth: public  
Authz: —  

Request:

```json
{
  "email": "customer@example.com",
  "password": "Password123",
  "fullName": "Demo Customer"
}
```

Response 201: user id, email, fullName, role (không password).

Errors: 400 validation, 409 `EMAIL_ALREADY_EXISTS`.

### POST /api/auth/login

Auth: public

Request:

```json
{
  "email": "customer@example.com",
  "password": "Password123"
}
```

Response 200:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "email": "customer@example.com",
      "fullName": "Demo Customer",
      "role": "CUSTOMER"
    }
  }
}
```

Errors: 401 `INVALID_CREDENTIALS`.

### GET /api/auth/profile

Auth: JWT  
Authz: authenticated

Response 200: profile hiện tại.

---

## 9.3 Product — PRODUCT-SERVICE

### GET /api/products

Auth: public  
Query: `page`, `size`, `keyword`, `categoryId`, `brand`, `minPrice`, `maxPrice`, `status`

Response 200: page content + pagination meta.

### GET /api/products/{id}

Auth: public  
Errors: 404 `PRODUCT_NOT_FOUND`.

### POST /api/products

Auth: JWT  
Authz: ADMIN  

Request:

```json
{
  "name": "Phone X",
  "description": "...",
  "price": 199.00,
  "categoryId": 1,
  "brand": "Acme",
  "imageUrl": "https://example.com/x.png",
  "status": "ACTIVE"
}
```

Response 201. Errors: 400, 403.

### PUT /api/products/{id}

Auth: JWT · ADMIN  
Response 200. Errors: 404, 403.

### DELETE /api/products/{id}

Auth: JWT · ADMIN  
Response 204 hoặc 200. Errors: 404, 403.

### Category (cùng service)

| Method | Path | Authz |
|--------|------|-------|
| GET | `/api/products/categories` | public |
| GET | `/api/products/categories/{id}` | public |
| POST | `/api/products/categories` | ADMIN |
| PUT | `/api/products/categories/{id}` | ADMIN |
| DELETE | `/api/products/categories/{id}` | ADMIN |

---

## 9.4 Cart — CART-SERVICE

Mọi API cart yêu cầu JWT CUSTOMER. `userId` lấy từ token.

### GET /api/cart

Response: cart + items.

### POST /api/cart/items

```json
{
  "productId": 1,
  "quantity": 2
}
```

201/200. Errors: 400 qty, 404 product.

### PUT /api/cart/items/{id}

```json
{ "quantity": 3 }
```

### DELETE /api/cart/items/{id}

### DELETE /api/cart

Clear cart.

Errors ownership: 403/404.

---

## 9.5 Inventory

### Public / Admin (qua Gateway nếu cần demo)

| Method | Path | Authz | Mô tả |
|--------|------|-------|--------|
| GET | `/api/inventory` | ADMIN | Danh sách tồn kho |
| GET | `/api/inventory/{productId}` | ADMIN | Chi tiết |
| PUT | `/api/inventory/{productId}` | ADMIN | Cập nhật available |

### Internal (service-to-service, không public)

| Method | Path | Caller |
|--------|------|--------|
| POST | `/internal/inventory/check` | Order Service |
| POST | `/internal/inventory/reserve` | Order Service |
| POST | `/internal/inventory/release` | Order Service |
| POST | `/internal/inventory/deduct` | Order Service |

Request:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

Success: `{ "available": true }` hoặc reservation id/status.

Errors: 409 `INSUFFICIENT_STOCK`.

---

## 9.6 Order — ORDER-SERVICE

### POST /api/orders

Auth: JWT CUSTOMER  
Mô tả: checkout + tạo order + reserve + gọi payment (orchestration).

Request:

```json
{
  "shippingName": "Nguyen Van A",
  "shippingPhone": "0900000000",
  "shippingAddress": "Ha Noi",
  "paymentMethod": "MOCK_CARD",
  "simulatePaymentFailure": false
}
```

`simulatePaymentFailure` chỉ dùng demo failure path (Phase 2), không dùng production.

Response 201: order + payment result.

Errors: 400 `CART_EMPTY`, 409 `INSUFFICIENT_STOCK`.

### GET /api/orders

Auth: CUSTOMER — chỉ đơn của mình.

### GET /api/orders/{id}

Auth: CUSTOMER owner hoặc ADMIN.

### POST /api/orders/{id}/cancel

Auth: owner.  
Errors: 409 `ORDER_NOT_CANCELLABLE`.

### Admin

| Method | Path | Authz |
|--------|------|-------|
| GET | `/api/admin/orders` | ADMIN |
| PATCH | `/api/admin/orders/{id}/status` | ADMIN |

```json
{ "status": "SHIPPING" }
```

---

## 9.7 Payment — PAYMENT-SERVICE

### POST /api/payments

Auth: service hoặc JWT (Order orchestration ưu tiên gọi nội bộ).

```json
{
  "orderId": 10,
  "userId": 2,
  "amount": 199.00,
  "method": "MOCK_CARD",
  "simulateFailure": false
}
```

Response 201: payment id + status.

### GET /api/payments/{id}

Auth: owner hoặc ADMIN.

---

## 9.8 Admin user APIs (Auth)

| Method | Path | Authz |
|--------|------|-------|
| GET | `/api/admin/users` | ADMIN |
| GET | `/api/admin/users/{id}` | ADMIN |
| PATCH | `/api/admin/users/{id}/status` | ADMIN |

---

## 9.9 Error codes (chính)

| Code | HTTP | Khi nào |
|------|------|---------|
| EMAIL_ALREADY_EXISTS | 409 | FR-01 |
| INVALID_CREDENTIALS | 401 | FR-02 |
| UNAUTHORIZED | 401 | Thiếu/sai JWT |
| FORBIDDEN | 403 | Sai role / không phải chủ resource |
| PRODUCT_NOT_FOUND | 404 | FR-05 |
| CART_EMPTY | 400 | BR-05 |
| INSUFFICIENT_STOCK | 409 | BR-06, BR-07 |
| ORDER_NOT_FOUND | 404 | FR-10 |
| ORDER_NOT_CANCELLABLE | 409 | BR-11 |
| VALIDATION_ERROR | 400/422 | Bean validation |
| INTERNAL_ERROR | 500 | Lỗi không mong đợi |

---

## 9.10 Gateway routing

| Predicate | Target |
|-----------|--------|
| `/api/auth/**` | AUTH-SERVICE |
| `/api/admin/users/**` | AUTH-SERVICE |
| `/api/products/**` | PRODUCT-SERVICE |
| `/api/cart/**` | CART-SERVICE |
| `/api/inventory/**` | INVENTORY-SERVICE |
| `/api/orders/**` | ORDER-SERVICE |
| `/api/admin/orders/**` | ORDER-SERVICE |
| `/api/payments/**` | PAYMENT-SERVICE |

`/internal/**` không route ra Internet.

---

## 9.11 Phase 2 status

Contract đã implement trên backend. Swagger per service. Postman collection từ Phase 1 vẫn dùng được với JWT thực.

Internal APIs (không route Gateway):

- `POST /internal/inventory/{check,reserve,release,deduct}`
- `GET|DELETE /internal/cart/{userId}`
- `POST /internal/payments`

