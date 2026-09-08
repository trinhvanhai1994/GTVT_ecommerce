# Chương 2 — Phân tích nghiệp vụ

## 2.1 Vấn đề nghiệp vụ

Cửa hàng muốn bán sản phẩm online nhưng nếu xây một ứng dụng nguyên khối (monolith) ngay từ đầu mà không tách miền, việc mở rộng từng phần (catalog, order, payment) sẽ khó giải thích và khó demo kiến trúc phân tán.

Bài toán nghiệp vụ cốt lõi:

1. Khách hàng cần tìm và mua sản phẩm một cách tin cậy.
2. Hệ thống không được bán vượt tồn kho (oversell).
3. Thanh toán có thể thành công hoặc thất bại; thất bại phải hoàn tồn kho đã giữ.
4. Quản trị viên cần quản lý sản phẩm, danh mục, tồn kho và đơn hàng.
5. Thông báo đơn hàng không được làm hỏng giao dịch đặt hàng.

## 2.2 Mục tiêu nghiệp vụ

| ID | Goal |
|----|------|
| BG-01 | Khách hàng đăng ký / đăng nhập an toàn. |
| BG-02 | Khách hàng duyệt, tìm, xem chi tiết sản phẩm. |
| BG-03 | Khách hàng quản lý giỏ hàng và checkout. |
| BG-04 | Tạo đơn chỉ khi còn đủ hàng; reserve stock trước thanh toán. |
| BG-05 | Thanh toán mock; success thì confirm order, fail thì release stock. |
| BG-06 | Khách hàng xem / hủy đơn ở trạng thái hợp lệ. |
| BG-07 | Admin quản lý user, product, category, inventory, order. |
| BG-08 | Gửi thông báo bất đồng bộ, không chặn order transaction. |

## 2.3 Stakeholders

| Stakeholder | Vai trò | Quan tâm |
|-------------|---------|----------|
| Customer | Người mua | Mua hàng nhanh, đúng giá, đúng tồn kho, theo dõi đơn |
| Admin | Người quản trị cửa hàng | CRUD catalog, điều chỉnh stock, xử lý đơn |
| Product Owner / Giảng viên | Người đánh giá đồ án | Đúng kiến trúc, đúng nghiệp vụ, demo được |
| Hệ thống thanh toán (mock) | Actor bên ngoài giả lập | Nhận yêu cầu thanh toán, trả SUCCESS / FAILED |
| Hệ thống thông báo | Actor nội bộ | Nhận event, ghi nhận thông báo |

## 2.4 Actors

### ACTOR-01 Customer

Người dùng đã đăng ký với vai trò `CUSTOMER`.

- Đăng ký, đăng nhập, đăng xuất, xem profile.
- Xem / tìm / lọc sản phẩm.
- Quản lý giỏ hàng.
- Checkout, thanh toán, xem và hủy đơn của chính mình.

Không được: CRUD product, xem cart/order của người khác, truy cập admin.

### ACTOR-02 Admin

Người dùng với vai trò `ADMIN`.

- Đăng nhập.
- Quản lý user, product, category, inventory, order.
- Cập nhật trạng thái đơn.
- Xem dashboard / thống kê cơ bản.

### ACTOR-03 Payment System

Hệ thống thanh toán **mock** (Payment Service).

- Nhận yêu cầu thanh toán (COD, MOCK_CARD, MOCK_BANKING).
- Trả về SUCCESS hoặc FAILED theo kịch bản giả lập.
- Không tích hợp cổng thanh toán thật.

### ACTOR-04 Notification System

Notification Service.

- Consume event từ RabbitMQ.
- Lưu notification, log console, mock email.
- Không được làm fail transaction của Order.

### ACTOR-05 Service / System Infrastructure

Eureka, API Gateway, PostgreSQL, RabbitMQ, Docker.

- Service discovery, routing, persistence, messaging, runtime.

## 2.5 Golden Path (luồng chính)

```
Customer
  → Login
  → Browse Products
  → Product Detail
  → Add To Cart
  → Cart
  → Checkout
  → Order Service
  → Check Inventory
  → Reserve Inventory
  → Payment
      ├─ SUCCESS → Confirm Order → Publish Event → RabbitMQ → Notification
      └─ FAILED  → Release Stock → Order PAYMENT_FAILED
```

Mọi use case, BPMN, sequence diagram, API, database và test case phải nhất quán với flow này.

## 2.6 Failure Path

Khi thanh toán thất bại:

1. Payment Service trả `FAILED`.
2. Order Service không confirm đơn.
3. Inventory Service **release** phần đã reserve.
4. Order chuyển `PAYMENT_FAILED`.
5. Event `PAYMENT_FAILED` được publish (best-effort).

## 2.7 Quy tắc nghiệp vụ (Business Rules)

| ID | Rule |
|----|------|
| BR-01 | Email user phải unique. |
| BR-02 | Password phải hash (BCrypt). Không trả password về client. |
| BR-03 | Chỉ ADMIN được CRUD product / category. Customer chỉ đọc catalog. |
| BR-04 | Customer chỉ truy cập cart và order của chính mình. |
| BR-05 | Cart rỗng không được checkout. |
| BR-06 | Stock không đủ thì không tạo order thành công. |
| BR-07 | Không oversell. `availableQuantity` không được < 0. |
| BR-08 | Chỉ khi payment SUCCESS mới confirm order. |
| BR-09 | Payment FAILED phải release reserved stock. |
| BR-10 | OrderItem lưu snapshot giá / tên sản phẩm tại thời điểm order. |
| BR-11 | Order chỉ được cancel ở trạng thái hợp lệ (PENDING, PAYMENT_PENDING). Không cancel khi SHIPPING / DELIVERED. |
| BR-12 | Notification failure không rollback Order. |

## 2.8 Phạm vi chức năng theo vai trò

### Customer

Register, Login, Logout, xem/tìm/lọc sản phẩm, chi tiết sản phẩm, thêm/sửa/xóa giỏ, checkout, tạo đơn, thanh toán, lịch sử đơn, chi tiết đơn, hủy đơn hợp lệ, theo dõi trạng thái.

### Admin

Login, quản lý user, product, category, inventory, order, cập nhật trạng thái order, dashboard cơ bản.

## 2.9 Giả định

- Một cửa hàng (không phải marketplace đa người bán).
- Một giỏ hàng active cho mỗi customer.
- Thanh toán là mock, có thể điều khiển SUCCESS/FAILED để demo.
- Giá có thể đổi sau khi đặt hàng; vì vậy order item phải snapshot.
- Tồn kho được quản lý tập trung tại Inventory Service, không lưu stock trong Product Service.
