# Chương 11 — Kiểm thử và kịch bản demo

> Nội dung đồng bộ từ **mục 8** báo cáo (`BAO-CAO-DO-AN.md`).

# 8. Kịch bản kiểm thử và thuyết minh bảo vệ

## 8.1 Mở shop + mua hàng (~8 phút)

1. User đăng ký / login → **Đăng ký shop** (PENDING).
2. Platform Admin **approve** → shop hiện trên **Home**.
3. Seller vào **Kênh người bán** → tạo **category** + **product** + tồn kho.
4. Customer mở Home → chọn shop (`/shops/{id}`) → thấy **list SP** → (tuỳ chọn lọc category) → chi tiết SP → thêm giỏ.
5. (Tuỳ chọn) thêm SP shop thứ hai → giỏ **hai block shop**.
6. Checkout → **hai Order** (nếu hai shop) → payment SUCCESS → CONFIRMED.
7. Xem Notification / trạng thái đơn; Seller thấy đơn shop mình.

## 8.2 Thanh toán thất bại (~2 phút)

1. Checkout một shop với nhánh payment FAILED (hệ thống / API).
2. Stock **Release**; Order = `PAYMENT_FAILED`.

## 8.3 Từ chối / khóa shop (~1 phút)

1. Admin reject hoặc suspend → shop **không** còn trên Home; không bán.

## 8.4 Checklist thao tác Storefront (UI)

| # | Thao tác trên Nava | Route / màn hình | Kỳ vọng |
|---|-------------------|------------------|---------|
| UI-01 | Golden Path mua | `/` → `/shops/{id}` → PDP → `/cart` → `/checkout` | N Order nếu N shop; chuyển Order detail |
| UI-02 | Seller pending | `/register-shop` → `/seller` | Thấy trạng thái PENDING, chưa tab CRUD |
| UI-03 | Admin duyệt | `/admin` | Approve → shop xuất hiện Home (`/`) |
| UI-04 | Payment fail demo | `/checkout` + `simulatePaymentFailure` | Order `PAYMENT_FAILED`; thông báo |
| UI-05 | Seller không mua | Login seller → `/cart` | Redirect `/seller`; header không giỏ |
| UI-06 | Đơn bán | `/seller/orders` → chi tiết | `/seller/orders/:id?shopId=` — timeline + line items |
| UI-07 | Duyệt + email | Admin approve | Toast contactEmail; log `[MOCK EMAIL]` hoặc Brevo |
| UI-08 | Admin shop detail | `/admin/shops/:shopId` | Doanh thu GMV shop + danh sách SP xem nhanh |
| UI-09 | Theme | Admin vs Seller vs Home | Sidebar xanh vs teal vs storefront cam |
| UI-10 | Ba cổng login | Home → `/login`, `/seller/login`, `/admin/login` | Đúng role sau đăng nhập |
| UI-11 | Khóa khách | Admin tab Khách hàng → Khóa | `INACTIVE` không login |
| UI-12 | Sandbox | Seller gõ `/shops/1` hoặc `/` | Redirect `/seller` |
| UI-13 | Sandbox | Admin gõ `/` hoặc `/login` | Redirect `/admin` |

## 8.5 Checklist bảo vệ

| Câu hỏi | Trả lời gọn |
|---------|-------------|
| Vì sao tách shop-service? | Vòng đời duyệt shop khác catalog; Bounded context riêng. |
| Home hiện gì? | List shop APPROVED — không phải list SP toàn sàn. |
| Customer mua thế nào? | Vào shop theo `shopId` → list SP → giỏ → checkout. |
| Giỏ nhiều shop? | Group theo shop; N Order; mỗi Order một Saga. |
| Oversell? | Reserve trước pay. |
| Payment fail? | Release; `PAYMENT_FAILED`. |
| FE gọi đâu? | Chỉ API Gateway. |
| Có cổng thanh toán thật? | Không — Mock payment. |
| Vì sao URL dùng `shopId`? | Ổn định khi đổi tên shop; slug chỉ là hồ sơ. |
| MVP vs production? | MVP: Compose dev; prod: migration DB, Outbox, idempotent checkout, CI/CD rolling — mục 5.7. |
| Vì sao chưa Kafka? | Một consumer Notification; RabbitMQ đủ; Kafka khi cần replay/đa consumer. |

---
