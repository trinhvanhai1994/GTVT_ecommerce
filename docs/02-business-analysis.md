# 2. Vấn đề và phạm vi MVP

## 2.1 Vấn đề cần giải quyết

| # | Vấn đề | Cách hệ thống xử lý |
|---|--------|---------------------|
| 1 | Nhiều người bán trên một sàn | `shop-service`; mỗi SP gắn `shopId` |
| 2 | Shop chưa duyệt đã bán | Chỉ shop `APPROVED` hiện Home / cho bán |
| 3 | Customer lạc giữa hàng nghìn SP | Bắt buộc vào shop → list SP (lọc category tùy chọn) |
| 4 | Giỏ nhiều shop | Group theo shop; checkout **split** N Order |
| 5 | Oversell | Reserve trước pay; tồn không âm |
| 6 | Payment fail | Compensation: Release stock |
| 7 | Giá / shop đổi sau đặt | Snapshot SP + `shop_name` trên Order |
| 8 | Thông báo lỗi phá đơn | Notification async (BR-12) |
| 9 | Quyền lẫn lộn | JWT + CUSTOMER / SELLER / PLATFORM_ADMIN; Seller chỉ scope shop mình |

## 2.2 Phạm vi MVP

**Trong phạm vi**

- Đăng ký / duyệt / khóa shop (`shop-service`).
- Home = list shop; mua trong context shop (list SP, lọc category tùy chọn).
- Kênh người bán: category, product, inventory, đơn shop.
- Cart group shop; checkout N Order; Saga; Mock payment; Notification; giá VND.
- API Gateway, Eureka, Database per service, Storefront React (Nava).

**Ngoài phạm vi** (cắt gọn cho đồ án)

Livestream, ví sàn thật, affiliate, chat buyer–seller, rating đầy đủ, voucher phức tạp, logistics đối tác, quảng cáo shop, **tìm kiếm catalog toàn sàn** như luồng chính, hoa hồng / escrow, thanh toán gộp một lần cho nhiều shop.

## 2.3 Nguyên tắc đồ án

> Đủ nghiệp vụ sàn thật để bảo vệ. Đủ gọn để minh họa Microservices end-to-end.

---
