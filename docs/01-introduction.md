# Chương 1 — Giới thiệu

## 1.1 Bối cảnh

Thương mại điện tử đã trở thành kênh bán hàng phổ biến. Một cửa hàng trực tuyến cần cho phép khách hàng duyệt sản phẩm, thêm vào giỏ, đặt hàng, thanh toán và theo dõi đơn, đồng thời cho phép quản trị viên quản lý catalog, tồn kho và đơn hàng.

Đồ án này xây dựng hệ thống e-commerce theo kiến trúc **microservices**, sử dụng **Spring Boot + Spring Cloud**, đủ để chạy, demo end-to-end và bảo vệ — không over-engineering.

Tên package thống nhất:

```
gtvt.haitv.ecommerce
```

## 1.2 Mục tiêu đồ án

1. Phân tích nghiệp vụ mua hàng trực tuyến (golden path và failure path).
2. Thiết kế kiến trúc microservices với ranh giới service rõ ràng.
3. Thiết kế database-per-service, API và luồng Saga đơn giản.
4. Tạo nền móng project (Phase 1) trước khi triển khai nghiệp vụ (Phase 2+).
5. Hệ thống cuối cùng phải demo được: đăng nhập → xem sản phẩm → giỏ hàng → checkout → kiểm tra tồn kho → thanh toán giả lập → xác nhận đơn → thông báo.

## 1.3 Phạm vi (In Scope)

| Bounded context | Mô tả |
|-----------------|--------|
| Identity & Access | Đăng ký, đăng nhập, JWT, vai trò CUSTOMER / ADMIN |
| Product Catalog | Sản phẩm, danh mục, tìm kiếm, lọc, phân trang |
| Shopping Cart | Giỏ hàng theo user |
| Inventory | Tồn kho khả dụng / đã reserve |
| Order Management | Tạo đơn, vòng đời đơn, hủy đơn |
| Payment | Thanh toán giả lập (MOCK) |
| Notification | Nhận event từ RabbitMQ, lưu và log |

## 1.4 Ngoài phạm vi (Out of Scope)

- AI recommendation / Machine Learning
- Livestream, chat realtime
- Multi-vendor marketplace
- ERP, kế toán
- Logistics / vận chuyển thực tế
- Cổng thanh toán thật (Stripe, PayPal, VNPay production)
- Observability nâng cao (Prometheus/Grafana) — không triển khai nếu làm phức tạp đồ án

## 1.5 Người dùng mục tiêu

- **Customer**: mua hàng trên storefront.
- **Admin**: quản lý catalog, inventory, order, user và xem thống kê cơ bản.

## 1.6 Kết quả mong đợi của Phase 1

Phase 1 **không** hoàn thiện business feature. Phase 1 hoàn thiện:

- Phân tích nghiệp vụ và yêu cầu
- Use case và BPMN
- Kiến trúc và ranh giới service
- Thiết kế CSDL và API
- Skeleton project + hạ tầng tối thiểu
- Tài liệu nhất quán để Phase 2 code đúng thiết kế

## 1.7 Nguyên tắc

> SIMPLE ENOUGH TO FINISH.  
> STRONG ENOUGH TO DEFEND.

Ưu tiên đúng nghiệp vụ, đúng kiến trúc, chạy được, demo được, giải thích được.
