---
source: BAO-CAO-DO-AN.md
generated_by: scripts/build_docs_from_bao_cao.py
generated_on: 2026-10-22
chapter_id: 03-tac-nhan-chuc-nang-business-rules
title: # 3. Tác nhân – Chức năng – Business Rules
do_not_edit: Regenerate with `python3 scripts/build_docs_from_bao_cao.py`
---

# 3. Tác nhân – Chức năng – Business Rules

## 3.1 Tác nhân

| ID | Tác nhân | Loại | Vai trò |
|----|----------|------|---------|
| ACTOR-01 | Customer | Chính | Người mua — vào shop rồi mới chọn hàng |
| ACTOR-02 | Seller | Chính | Chủ shop — đăng ký, quản lý gian hàng |
| ACTOR-03 | Platform Admin | Chính | Duyệt/khóa shop; tổng quan doanh thu shop; khóa tài khoản khách |
| ACTOR-04 | Payment System | Phụ (mock) | SUCCESS / FAILED per Order |
| ACTOR-05 | Notification System | Phụ | Consume event |
| ACTOR-06 | Hạ tầng | Phụ | Eureka, Gateway, PostgreSQL, RabbitMQ |

## 3.2 Customer — chức năng

| Mã | Chức năng | Mô tả |
|----|-----------|-------|
| FR-01 | Đăng ký / đăng nhập | Email unique, BCrypt, JWT; role mặc định CUSTOMER |
| FR-02 | Xem list shop (Home) | Chỉ shop `APPROVED`; tìm theo tên |
| FR-03 | Vào shop | Mở `/shops/{shopId}` — list SP của shop |
| FR-04 | Lọc loại hàng trong shop | Category thuộc `shopId` (tùy chọn trên list) |
| FR-05 | Xem / chọn SP trong shop | List + PDP scoped `shopId` (+ `categoryId` nếu lọc) |
| FR-06 | Quản lý giỏ | Thêm / sửa / xóa; UI group theo shop |
| FR-07 | Checkout | Tạo N Order (1 / shop); địa chỉ + phương thức TT |
| FR-08 | Xem / hủy đơn | Chỉ đơn của mình; hủy khi trạng thái hợp lệ |
| FR-09 | Theo dõi đơn | PENDING → … → DELIVERED / CANCELLED / PAYMENT_FAILED |

Customer **không** CRUD shop / category / product.

## 3.3 Seller — chức năng (đăng ký shop & Kênh người bán)

| Mã | Chức năng | Mô tả |
|----|-----------|-------|
| FR-S01 | Mở form đăng ký shop | `/register-shop` — cần login |
| FR-S02 | Gửi hồ sơ shop | Tên, slug (unique hồ sơ), mô tả, logo URL → `PENDING` |
| FR-S03 | Gán Owner + role | `shop_members` OWNER; user → role `SELLER` |
| FR-S04 | Xem trạng thái hồ sơ | PENDING / REJECTED (+ lý do) / APPROVED / SUSPENDED |
| FR-S05 | Sửa hồ sơ shop | Sau APPROVED — tên, mô tả, logo (phạm vi cho phép); URL Storefront vẫn theo `id` |
| FR-S06 | Kênh người bán — category | CRUD category **trong shop** |
| FR-S07 | Kênh người bán — product | CRUD SP scoped `shopId` |
| FR-S08 | Kênh người bán — tồn kho | Cập nhật tồn SP của shop |
| FR-S09 | Kênh người bán — đơn | Xem / đổi trạng thái fulfillment đơn **của shop mình** |
| FR-S10 | Thống kê seller | `GET /orders/seller-stats?shopId=&days=` (alias `/orders/seller/stats`) |

MVP: một user Owner tối đa **một** shop đang `PENDING` hoặc `APPROVED`.

## 3.4 Platform Admin — chức năng

| Mã | Chức năng | Mô tả |
|----|-----------|-------|
| FR-A01 | Đăng nhập | Role PLATFORM_ADMIN |
| FR-A02 | Duyệt shop | `APPROVED` → hiện Home |
| FR-A03 | Từ chối shop | `REJECTED` + `reject_reason` |
| FR-A04 | Khóa shop | `SUSPENDED` — ẩn Home, không bán |
| FR-A05 | Tổng quan doanh thu sàn | GMV + bảng **doanh thu theo shop** (aggregate từ `GET /admin/orders`, đơn CONFIRMED→DELIVERED) |
| FR-A06 | Quản lý khách hàng | Khóa / mở khóa tài khoản CUSTOMER |

Platform Admin **không** đăng SP hộ Seller (MVP). **Không** có trang `/admin/orders` trên Storefront (API admin orders vẫn tồn tại phục vụ thống kê).

## 3.5 Ánh xạ chức năng → Storefront (Nava)

Storefront (`frontend/`) triển khai các FR ở mục 3.2–3.4. Mọi HTTP đi qua **`/api`** (dev: Vite proxy → Gateway `:8080`). Envelope JSON thống nhất mục 7.2.

### Bảng 3.5.1 — Customer

| FR | Route | Page (component) | API chính qua Gateway |
|----|-------|------------------|------------------------|
| FR-01 | `/register`, `/login` | `RegisterPage`, `LoginPage` (cổng **khách**) | `POST /auth/register`, `POST /auth/login` |
| — | `/admin/login` | `AdminLoginPage` | Chỉ `PLATFORM_ADMIN` → `/admin` |
| — | `/seller/login` | `SellerLoginPage` | Chỉ `SELLER` → `/seller` / `/register-shop` |
| FR-01 | `/forgot-password`, `/reset-password` | `ForgotPasswordPage`, `ResetPasswordPage` | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| FR-02 | `/` | `HomePage` | `GET /shops?status=APPROVED&q=` |
| FR-03–05 | `/shops/:shopId` | `ShopProductListPage` | `GET /shops/id/{shopId}`, `GET /products?shopId=`, `GET /products/categories?shopId=` |
| FR-05 | `.../products/:id`, `/products/:id` | `ProductDetailPage` | `GET /products/{id}`; thêm giỏ: `POST /cart/items` |
| FR-06 | `/cart` | `CartPage` | `GET /cart`, `PUT /cart/items/{id}`, `DELETE /cart/items/{id}`, `DELETE /cart`; enrich `GET /products/{id}`, `GET /shops/id/{shopId}` |
| FR-07 | `/checkout` | `CheckoutPage` | `POST /orders` (body: địa chỉ, `paymentMethod`, `simulatePaymentFailure` demo Saga) |
| FR-08–09 | `/orders`, `/orders/:id` | `OrderListPage`, `OrderDetailPage` | `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel` |
| — | `/notifications` | `NotificationsPage` | `GET /notifications` (Layout poll badge khi đăng nhập) |
| — | `/profile` | `ProfilePage` | Đọc profile từ JWT/local; liên kết thông báo |

**Ghi chú UI:** `CartPage` gom dòng giỏ theo `shopId` (Map) — chuẩn bị tâm lý checkout **N Order** (BR-MV-04). Khách chưa login có thể lưu SP vào **pending cart** (localStorage); sau login `LoginPage` gọi `POST /cart/items`.

### Bảng 3.5.2 — Seller & Platform Admin

| FR | Route | Page | API chính |
|----|-------|------|-----------|
| FR-S01–02 | `/register-shop` | `RegisterShopPage` | `POST /shops` |
| FR-S03–04 | `/seller` | `SellerLayout` + `SellerOverview` | `GET /shops/me`; dashboard KPI + `GET /orders/seller-stats?shopId=&days=7` |
| FR-S06–08 | `/seller/products`, `/categories`, `/inventory` | `SellerProductsPage`, … | CRUD product/category; `PUT /inventory/{productId}` |
| FR-S09 | `/seller/orders`, `/seller/orders/:id` | `SellerOrdersPage`, `SellerOrderDetailPage` | `GET /orders/seller?shopId=`; fulfillment PATCH |
| FR-S — | `/seller/settings` | `SellerSettingsPage` | `PUT /shops/me` |
| FR-S02b | `/register-shop` | `RegisterShopPage` | `contactEmail` bắt buộc |
| FR-A05 | `/admin` | `AdminLayout` → `AdminOverview` | KPI GMV; bảng doanh thu theo shop; `GET /admin/orders`, `/admin/shops`, `/admin/users` |
| FR-A02–04 | `/admin/shops`, `/admin/shops/:shopId` | `AdminShopsPage`, `AdminShopDetailPage` | Duyệt/từ chối/tạm ngưng; chi tiết — doanh thu shop + xem nhanh SP |
| FR-A06 | `/admin/customers` | `AdminCustomersPage` | `PATCH /admin/users/{id}/status` |
| — | `/admin/orders` | *(redirect → `/admin`)* | Legacy URL; không còn UI quản lý đơn admin |

### Quy tắc hiển thị (BR-UI)

| ID | Quy tắc | Triển khai |
|----|---------|------------|
| BR-UI-01 | SELLER không dùng luồng mua | `ProtectedRoute role=CUSTOMER` → redirect `/seller` |
| BR-UI-02 | PDP với SELLER | Không buy-box; CTA theo shop của mình vs shop khác |
| BR-UI-03 | Header SELLER | Ẩn giỏ, thông báo, “Đơn hàng”, “Đăng ký bán”; có “Xem vitrine” |
| BR-UI-04 | Đơn bán | Link `/seller/orders/:id?shopId=` — không `/orders/:id` |
| BR-UI-05 | Đăng ký bán | Ẩn khi đã `SELLER` (Layout, Home) |
| BR-UI-06 | MK tạm | Login SELLER + `mustChangePassword` → `/change-password` |
| BR-UI-07 | Admin login | Quản trị **chỉ** `/admin/login` — `/login` từ chối admin |
| BR-UI-08 | Shop APPROVED | `/register-shop` → redirect `/seller`; onboarding trong `/seller` |
| BR-UI-09 | Sandbox route | Sau login: ADMIN chỉ `/admin*`; SELLER chỉ `/seller*` + `/change-password`; CUSTOMER không vào `/admin*`/`/seller*` |
| BR-UI-10 | Đồng bộ role | Sau `POST /shops` gọi `refreshProfile()`; F5 có token → `GET /auth/profile`; seller không quản lý qua PDP vitrine |
| — | Theme | Storefront (cam) · `/admin/*` **Platform Console** (`PlatformShell`, sidebar tối) · merchant: `/seller/*` (`MerchantShell`) |
| — | Shop PENDING | `RegisterShopPage` / `SellerOnboarding` — chưa sidebar CRUD đầy đủ |
| — | Home guest | CTA: đăng nhập khách · người bán · quản trị sàn |

## 3.6 Business Rules

| ID | Quy tắc |
|----|---------|
| BR-01 | Email unique |
| BR-02 | Password BCrypt; không trả về client |
| BR-03 | Chỉ Seller (Owner/Staff ACTIVE) CRUD category/SP của shop mình |
| BR-04 | Customer chỉ xem dữ liệu đơn/giỏ của mình |
| BR-05 | Giỏ rỗng không checkout |
| BR-06 | Không đủ hàng → không tạo Order thành công |
| BR-07 | Không Oversell; tồn không âm |
| BR-08 | Payment SUCCESS mới confirm Order |
| BR-09 | Payment FAILED phải Release stock |
| BR-10 | OrderItem Snapshot giá; Order Snapshot `shop_name` |
| BR-11 | Chỉ hủy ở trạng thái hợp lệ |
| BR-12 | Notification fail không rollback Order |
| BR-MV-01 | Chỉ shop `APPROVED` xuất hiện trên Home và cho phép bán |
| BR-MV-02 | Mọi product/category thuộc đúng một `shopId` |
| BR-MV-03 | Luồng mua chính: chọn shop → list SP (lọc category tùy chọn); không catalog toàn sàn |
| BR-MV-04 | Checkout: một Order chỉ thuộc một shop; giỏ đa shop → N Order |
| BR-MV-05 | Seller chỉ truy cập dữ liệu shop mình; Admin duyệt shop qua `shop-service` |
| BR-MV-06 | Shop `SUSPENDED` / `REJECTED` / `PENDING` không hiện Home |

---
