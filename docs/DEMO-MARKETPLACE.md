# Demo Marketplace MVP

## Accounts (Password123)

| Email | Role |
|-------|------|
| admin@example.com | PLATFORM_ADMIN |
| customer@example.com | CUSTOMER |
| seller@example.com | SELLER (owner Tech Haven nếu seed) |
| seller2@example.com | SELLER (owner Audio Lab nếu seed) |

## Ports

- Gateway `8080`, shop-service **`8089`** (admin-server giữ 8088)

## Trước khi chạy lần đầu

1. Tạo DB: `CREATE DATABASE shop_db;`
2. (Nếu DB cũ) chạy `scripts/migrate-product-shopid.sql`
3. Start: Eureka → Gateway → auth, shop, product, cart, inventory, order, payment, notification → frontend

## Checklist demo

1. Admin login → Admin → **Duyệt shop** (approve PENDING nếu có).
2. Home: thấy shop APPROVED (Tech Haven, Audio Lab).
3. Customer: vào shop → chọn category → thêm giỏ → checkout → có thể nhiều Order.
4. Seller: login lại → Seller Center → thêm category/SP → xem đơn shop.
5. Đăng ký shop mới: `/register-shop` → PENDING → admin approve → Home hiện shop → re-login seller.

## Lưu ý

- Sau `POST /api/shops`, role DB = SELLER nhưng JWT cũ vẫn CUSTOMER → **đăng nhập lại**.
- Catalog toàn sàn không còn là luồng chính; mua qua `/shops/:slug`.
