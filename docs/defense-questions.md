# Câu hỏi bảo vệ — Phụ lục

> Trích từ **Phụ lục Q&A** báo cáo đồ án.

## Phụ lục — Q&A bảo vệ

| Câu hỏi | Trả lời gọn |
|---------|-------------|
| Marketplace khác single-store? | Nhiều shop; bắt buộc chọn shop trước khi mua. |
| shop-service làm gì? | Đăng ký, duyệt, list/chi tiết shop; SoT status. |
| Vì sao không FK product → shop? | Database per service; chỉ lưu `shopId`. |
| Category thuộc ai? | Thuộc shop (`categories.shop_id`); lọc trên list SP. |
| Split Order là gì? | Mỗi shop một Order; Saga và payment riêng. |
| Ai duyệt shop? | Platform Admin qua `shop-service`. |
| Notification lỗi mất đơn? | Không rollback Order — event sau commit; MQ fail có thể mất mail (Outbox ở mục 5.7). |
| Storefront điều hướng shop thế nào? | `/shops/{shopId}` — không phụ thuộc tên/slug. |
| Frontend có gọi thẳng product-service? | **Không** — chỉ `/api` qua Gateway; xem mục 5.6. |
| State phía client quản lý thế nào? | React Context (Auth, Cart, Dialog); không Redux. |

---

*Hết báo cáo. Tài liệu phản ánh thiết kế và triển khai MVP hiện tại (gồm `shop-service` và Storefront Nava).*
