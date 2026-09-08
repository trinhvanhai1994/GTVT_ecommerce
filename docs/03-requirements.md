# Chương 3 — Đặc tả yêu cầu

## 3.1 Actors (tóm tắt)

| ID | Actor | Loại |
|----|-------|------|
| ACTOR-01 | Customer | Primary |
| ACTOR-02 | Admin | Primary |
| ACTOR-03 | Payment System | Supporting (mock) |
| ACTOR-04 | Notification System | Supporting |
| ACTOR-05 | Service / Infrastructure | Supporting |

Chi tiết vai trò: xem `02-business-analysis.md`.

---

## 3.2 Functional Requirements

| ID | Name | Actor | Mô tả | Priority |
|----|------|-------|--------|----------|
| FR-01 | Register | Customer | Đăng ký tài khoản bằng email unique, password được hash, role mặc định CUSTOMER. | Must |
| FR-02 | Login | Customer, Admin | Đăng nhập, nhận JWT, xác định role. | Must |
| FR-03 | View Products | Customer, Admin | Danh sách sản phẩm có phân trang. | Must |
| FR-04 | Search Products | Customer, Admin | Tìm theo tên / mô tả; lọc category, brand, khoảng giá, status. | Must |
| FR-05 | View Product Detail | Customer, Admin | Xem chi tiết một sản phẩm. | Must |
| FR-06 | Manage Cart | Customer | Xem giỏ, thêm, đổi số lượng, xóa item, xóa giỏ. | Must |
| FR-07 | Checkout | Customer | Từ giỏ hợp lệ khởi tạo quy trình đặt hàng. | Must |
| FR-08 | Create Order | Customer | Tạo order + order items (snapshot), kiểm tra và reserve inventory. | Must |
| FR-09 | Payment | Customer, Payment System | Tạo payment mock; SUCCESS hoặc FAILED. | Must |
| FR-10 | View Order | Customer | Xem danh sách và chi tiết đơn của chính mình. | Must |
| FR-11 | Cancel Order | Customer | Hủy đơn khi trạng thái hợp lệ; release stock nếu đã reserve. | Must |
| FR-12 | Track Order | Customer | Theo dõi trạng thái: PENDING → … → DELIVERED / CANCELLED / PAYMENT_FAILED. | Must |
| FR-13 | Manage Products | Admin | CRUD sản phẩm. | Must |
| FR-14 | Manage Categories | Admin | CRUD danh mục. | Must |
| FR-15 | Manage Inventory | Admin | Xem / cập nhật tồn kho; hệ thống check / reserve / release / deduct. | Must |
| FR-16 | Manage Orders | Admin | Xem mọi đơn, cập nhật trạng thái xử lý / giao hàng. | Must |
| FR-17 | Send Notification | Notification System | Consume event và lưu / log thông báo. | Must |

### Mapping FR → Golden Path

```
FR-02 Login
  → FR-03/04/05 Product
  → FR-06 Cart
  → FR-07 Checkout
  → FR-08 Create Order + FR-15 Inventory
  → FR-09 Payment
  → FR-12 Track Order + FR-17 Notification
```

---

## 3.3 Non-functional Requirements

Yêu cầu đặt ở mức đồ án sinh viên — có thể kiểm chứng, không thổi phồng.

| ID | Name | Requirement | Cách kiểm chứng |
|----|------|-------------|-----------------|
| NFR-01 | Security | JWT, BCrypt, RBAC (CUSTOMER/ADMIN), validation, CORS, không hard-code secret. Password/JWT đầy đủ không được log. | Test authz; scan config |
| NFR-02 | Performance | API đọc catalog phản hồi chấp nhận được trên môi trường local (mục tiêu < 2s cho trang danh sách với dữ liệu seed). Không cam kết SLA production. | Gọi API local |
| NFR-03 | Availability | Từng service có health endpoint (Actuator). Hạ tầng Docker restart được. Không cam kết 99.9%. | `/actuator/health` |
| NFR-04 | Maintainability | Layered architecture (controller → service → repository), DTO, exception handler thống nhất, code đọc được. | Review cấu trúc |
| NFR-05 | Scalability | Tách service theo bounded context; stateless API; discovery qua Eureka. Scale ngang là hướng mở rộng, không bắt buộc demo multi-instance. | Kiến trúc + giải thích |
| NFR-06 | Reliability | Saga + compensation khi payment fail; notification lỗi không rollback order; không oversell. | Test success/failure path |
| NFR-07 | Usability | Frontend có loading, error, empty state, validation, protected/role route, responsive cơ bản. | Demo UI |

---

## 3.4 Constraint

| ID | Constraint |
|----|------------|
| C-01 | Java 21, Spring Boot 3.x, Spring Cloud, PostgreSQL, RabbitMQ, React + Vite. |
| C-02 | Database per service. Không FK cross-service. |
| C-03 | Payment là mock. |
| C-04 | Package root: `gtvt.haitv.ecommerce`. |
| C-05 | Secret lấy từ environment variables. |
| C-06 | Không distributed DB transaction. Dùng Saga orchestration đơn giản. |

---

## 3.5 Order status

`PENDING` → `PAYMENT_PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPING` → `DELIVERED`

Nhánh lỗi / hủy:

- `CANCELLED`
- `PAYMENT_FAILED`

## 3.6 Payment status / method

Status: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`

Method: `COD`, `MOCK_CARD`, `MOCK_BANKING`

## 3.7 Notification events

`ORDER_CREATED`, `ORDER_CONFIRMED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `ORDER_SHIPPED`, `ORDER_DELIVERED`
