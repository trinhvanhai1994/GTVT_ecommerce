# Demo Marketplace MVP — Nava

> Đồng bộ với mục 8 báo cáo. Chi tiết UI: `13-demo.md`, `bao-cao/08-kich-ban-kiem-thu-va-thuyet-minh-bao-ve.md`.

## Tài khoản (mật khẩu `Password123`)

| Email | Role | Ghi chú |
|-------|------|---------|
| admin@example.com | PLATFORM_ADMIN | `/admin/login` → Platform Console |
| customer@example.com | CUSTOMER | Storefront `/login` |
| seller@example.com | SELLER | `/seller/login` — owner shop seed (vd. Tech Haven) |
| seller2@example.com | SELLER | Owner shop seed thứ hai (vd. Audio Lab) |

## URL

| Thành phần | Địa chỉ |
|------------|---------|
| Storefront | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| shop-service | **8089** (admin-server giữ 8088) |

## Ba cổng đăng nhập

| Cổng | Route | Sau login |
|------|-------|-----------|
| Khách | `/login` | Home `/` |
| Người bán | `/seller/login` | `/seller` hoặc `/register-shop` |
| Quản trị sàn | `/admin/login` | `/admin` (GMV, gian hàng, khách hàng) |

## Checklist demo (~10 phút)

1. **Admin** — `/admin`: duyệt shop PENDING; xem **doanh thu theo gian hàng** (nếu đã có đơn).
2. **Home** — `/`: shop `APPROVED`.
3. **Customer** — `/shops/{shopId}` → PDP → giỏ → checkout (N shop → N Order).
4. **Seller** — `/seller`: category, SP, tồn, đơn shop; KPI `GET /orders/seller-stats`.
5. **Payment fail** — checkout + `simulatePaymentFailure` → `PAYMENT_FAILED`, release kho.
6. **Đăng ký shop mới** — `/register-shop` → PENDING → admin approve → **đăng nhập lại** seller.

## Lưu ý

- Storefront điều hướng shop bằng **`shopId`**: `/shops/{shopId}` (slug chỉ hồ sơ).
- Sau `POST /api/shops`, JWT cũ có thể vẫn CUSTOMER → **login lại**.
- `/admin/orders` redirect về `/admin` (không UI xử lý đơn toàn sàn).

*File sinh bởi `scripts/build_docs_from_bao_cao.py`.*
