# Chương 10 — Bảo mật (Phase 2)

## 10.1 Cơ chế

- Spring Security stateless.
- JWT HS256, secret từ `JWT_SECRET` (env).
- Password BCrypt. Không trả password/hash ra API.
- Roles: `CUSTOMER`, `ADMIN` (claim `role`, authority `ROLE_*`).

## 10.2 Public vs protected

| Path | Auth |
|------|------|
| `POST /api/auth/register`, `/login` | public |
| `GET /api/products/**` | public |
| `/actuator/**`, `/v3/api-docs/**`, `/swagger-ui/**`, `/info` | public |
| `/internal/**` | permitAll trên service (Gateway **không** route `/internal`) |
| `/api/cart/**` | CUSTOMER |
| Product write | ADMIN |
| `/api/inventory/**` | ADMIN |
| `/api/orders/**` | authenticated; write CUSTOMER; owner check |
| `/api/admin/**` | ADMIN |

## 10.3 Ownership

`SecurityUtils.requireOwnerOrAdmin` cho order detail và payment GET.

Customer không đọc cart/order của user khác: `userId` lấy từ JWT, không từ client.

## 10.4 Gateway

Gateway Phase 2: routing + CORS. JWT không terminate tại Gateway (tránh double-parse). Service tự validate.

## 10.5 Secrets

Không hard-code DB/Rabbit/JWT trong source (default local chỉ cho dev, override bằng `.env`).
