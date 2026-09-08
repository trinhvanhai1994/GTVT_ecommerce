# AI CODING AGENT OVERVIEW
# E-COMMERCE MICROSERVICES SYSTEM

> Tài liệu này là instruction nền tảng dành cho AI Coding Agent.
> Agent PHẢI đọc toàn bộ file này trước khi bắt đầu triển khai bất kỳ code nào.
>
> Sau đó Agent phải đọc `01-PHASES.md` và chỉ thực hiện PHASE được yêu cầu.

---

# 1. ROLE

Bạn là Senior Software Architect + Senior Business Analyst + Senior Backend Engineer
+ Senior Fullstack Engineer + DevOps Engineer + Technical Writer.

Bạn đang hỗ trợ xây dựng đồ án sinh viên CNTT:

"XÂY DỰNG HỆ THỐNG E-COMMERCE SỬ DỤNG KIẾN TRÚC MICROSERVICES
VỚI SPRING BOOT + SPRING CLOUD"

tên các service theo form gtvt.haitv.ecommerce 

Hệ thống phải được xây dựng ở mức:

- Có kiến trúc rõ ràng.
- Có nghiệp vụ thực tế.
- Có thể chạy được.
- Có thể demo end-to-end.
- Có tài liệu để nộp.
- Có thể giải thích khi bảo vệ.
- Không over-engineering.
- Không tạo code chỉ để làm cho project lớn.

Nguyên tắc:

> SIMPLE ENOUGH TO FINISH.
> STRONG ENOUGH TO DEFEND.

---

# 2. OBJECTIVE

Xây dựng một hệ thống thương mại điện tử cho phép:

## Customer

- Register.
- Login.
- Logout.
- Xem sản phẩm.
- Tìm kiếm sản phẩm.
- Lọc sản phẩm.
- Xem chi tiết sản phẩm.
- Thêm sản phẩm vào giỏ hàng.
- Cập nhật số lượng.
- Xóa sản phẩm.
- Checkout.
- Tạo đơn hàng.
- Thanh toán.
- Xem lịch sử đơn hàng.
- Xem chi tiết đơn hàng.
- Hủy đơn hàng khi hợp lệ.
- Theo dõi trạng thái đơn hàng.

## Admin

- Login.
- Quản lý người dùng.
- Quản lý sản phẩm.
- Quản lý category.
- Quản lý inventory.
- Quản lý order.
- Cập nhật trạng thái order.
- Xem dashboard/thống kê cơ bản.

---

# 3. MAIN BUSINESS FLOW

Business flow quan trọng nhất của hệ thống:

Customer
    |
    v
Login
    |
    v
Browse Products
    |
    v
Product Detail
    |
    v
Add To Cart
    |
    v
Cart
    |
    v
Checkout
    |
    v
Order Service
    |
    v
Check Inventory
    |
    v
Reserve Inventory
    |
    v
Payment
   / \
  /   \
SUCCESS FAILED
 |       |
 v       v
Confirm  Release Stock
Order      |
 |          v
 |       Payment Failed
 v
Publish Event
 |
 v
RabbitMQ
 |
 v
Notification Service

Đây là Golden Path của toàn bộ hệ thống.

Tất cả architecture, sequence diagram, API, database,
test case và demo phải nhất quán với flow này.

---

# 4. SYSTEM SCOPE

Hệ thống bao gồm các bounded context:

1. Identity & Access
2. Product Catalog
3. Shopping Cart
4. Inventory
5. Order Management
6. Payment
7. Notification

Không mở rộng sang các chức năng không cần thiết:

- AI recommendation.
- Machine Learning.
- Livestream.
- Chat realtime.
- Multi-vendor marketplace.
- ERP.
- Accounting.
- Logistics thực tế.
- Payment gateway thật.

Payment sử dụng MOCK PAYMENT.

---

# 5. ARCHITECTURE

Sử dụng Microservices Architecture.

High-level:

                    +----------------+
                    |    FRONTEND    |
                    |     React      |
                    +-------+--------+
                            |
                            v
                    +----------------+
                    |  API GATEWAY   |
                    +-------+--------+
                            |
            +---------------+----------------+
            |               |                |
            v               v                v
      AUTH SERVICE    PRODUCT SERVICE   CART SERVICE
            |
            |
            +-------------------------------+
                                            |
                  +-------------------------+
                  |
                  v
          INVENTORY SERVICE
                  |
                  v
            ORDER SERVICE
                  |
             +----+----+
             |         |
             v         v
        PAYMENT     RabbitMQ
        SERVICE        |
                       v
                NOTIFICATION
                   SERVICE

Infrastructure:

- Eureka Server
- API Gateway
- RabbitMQ
- MySQL
- Docker

---

# 6. SERVICES

## 6.1 Eureka Server

Responsibility:

- Service Discovery.
- Service registration.
- Service lookup.

Services đăng ký:

- AUTH-SERVICE
- PRODUCT-SERVICE
- CART-SERVICE
- INVENTORY-SERVICE
- ORDER-SERVICE
- PAYMENT-SERVICE
- NOTIFICATION-SERVICE

---

## 6.2 API Gateway

Responsibility:

- Routing.
- Entry point.
- CORS.
- Authentication filtering nếu phù hợp.
- Forward request tới service.

Routes:

/api/auth/**

/api/products/**

/api/cart/**

/api/inventory/**

/api/orders/**

/api/payments/**

---

## 6.3 Auth Service

Responsibility:

- User registration.
- Login.
- JWT.
- Password hashing.
- Role.
- User profile.

Roles:

CUSTOMER
ADMIN

---

## 6.4 Product Service

Responsibility:

- Product.
- Category.
- Search.
- Filter.
- Pagination.

Product:

- id
- name
- description
- price
- categoryId
- brand
- imageUrl
- status
- createdAt
- updatedAt

---

## 6.5 Cart Service

Responsibility:

- Shopping cart.
- Cart item.
- Add item.
- Update quantity.
- Remove item.
- Clear cart.

---

## 6.6 Inventory Service

Responsibility:

- Available stock.
- Reserved stock.
- Check stock.
- Reserve stock.
- Release stock.
- Deduct stock.

Inventory:

- id
- productId
- availableQuantity
- reservedQuantity
- updatedAt

Không được để:

availableQuantity < 0

---

## 6.7 Order Service

Responsibility:

- Create order.
- Order items.
- Order lifecycle.
- Checkout.
- Cancel order.

Order status:

PENDING
PAYMENT_PENDING
CONFIRMED
PROCESSING
SHIPPING
DELIVERED
CANCELLED
PAYMENT_FAILED

OrderItem phải lưu snapshot:

- productId
- productName
- quantity
- unitPrice
- subtotal

Lý do:

Giá sản phẩm có thể thay đổi sau khi order được tạo.

---

## 6.8 Payment Service

Mock payment.

Payment status:

PENDING
SUCCESS
FAILED
REFUNDED

Payment method:

COD
MOCK_CARD
MOCK_BANKING

Không tích hợp payment thật.

---

## 6.9 Notification Service

Nhận event từ RabbitMQ.

Các event:

ORDER_CREATED
ORDER_CONFIRMED
PAYMENT_SUCCESS
PAYMENT_FAILED
ORDER_SHIPPED
ORDER_DELIVERED

Notification có thể:

- Lưu database.
- Log console.
- Mock email.

Notification không được làm transaction Order fail.

---

# 7. TECHNOLOGY STACK

## Backend

- Java 21 LTS.
- Spring Boot 3.x.
- Spring Cloud.
- Spring Security.
- JWT.
- Spring Data JPA.
- Hibernate.
- Bean Validation.
- REST API.
- OpenFeign nếu phù hợp.
- Lombok nếu cần.

## Infrastructure

- Spring Cloud Gateway.
- Eureka.
- RabbitMQ.
- Docker.
- Docker Compose.

## Database

- MySQL.

## Frontend

- React.
- Vite.
- React Router.
- Axios.
- CSS/Tailwind/UI library đơn giản.

## Testing

- JUnit 5.
- Mockito.
- Spring Boot Test.
- Postman.

## Documentation

- Markdown.
- Mermaid.
- PlantUML nếu cần.
- Swagger/OpenAPI.

---

# 8. DATABASE PRINCIPLE

Sử dụng:

DATABASE PER SERVICE.

Logical databases:

auth_db
product_db
cart_db
inventory_db
order_db
payment_db
notification_db

Không service nào được phép query database của service khác.

Không tạo foreign key cross-service.

Ví dụ:

Order:

userId

Không tạo FK:

order.userId -> auth_db.users.id

Cross-service reference chỉ dùng ID.

---

# 9. DATABASE TABLES

## auth_db

users

## product_db

products
categories

## cart_db

carts
cart_items

## inventory_db

inventories

## order_db

orders
order_items

## payment_db

payments

## notification_db

notifications

---

# 10. COMMUNICATION

## Synchronous

Sử dụng:

- REST.
- OpenFeign nếu phù hợp.

Ví dụ:

Order Service
    |
    v
Inventory Service

Order Service
    |
    v
Payment Service

## Asynchronous

Sử dụng:

RabbitMQ.

Ví dụ:

Order Service
    |
    v
RabbitMQ
    |
    v
Notification Service

---

# 11. SAGA

Không sử dụng distributed database transaction.

Dùng Saga orchestration đơn giản.

Flow:

Create Order
    |
    v
Check Inventory
    |
    v
Reserve Inventory
    |
    v
Payment
    |
    +------ SUCCESS ------> Confirm Order
    |
    +------ FAILED -------> Release Inventory
                                  |
                                  v
                           Payment Failed

Compensation:

Payment Failed
    ->
Release Inventory
    ->
Order PAYMENT_FAILED

---

# 12. SECURITY

Implement:

- Spring Security.
- JWT.
- BCrypt.
- Role-based authorization.
- Validation.
- CORS.
- Protected endpoints.

Roles:

CUSTOMER
ADMIN

Rules:

- Customer không được CRUD Product.
- Customer không được truy cập Order của người khác.
- Customer không được truy cập Cart của người khác.
- Admin có quyền quản lý Product.
- Admin có quyền quản lý Order.
- Password không bao giờ trả về client.

Không hard-code:

- JWT secret.
- Database password.
- RabbitMQ password.
- Email credential.

Sử dụng environment variables.

---

# 13. BUSINESS RULES

BR-01:

Email user phải unique.

BR-02:

Password phải hash.

BR-03:

Chỉ ADMIN được CRUD product.

BR-04:

Customer chỉ truy cập dữ liệu của chính mình.

BR-05:

Cart rỗng không được checkout.

BR-06:

Stock không đủ thì không được tạo order thành công.

BR-07:

Không được oversell.

BR-08:

Payment success mới confirm order.

BR-09:

Payment failed phải release reserved stock.

BR-10:

OrderItem lưu giá tại thời điểm order.

BR-11:

Order chỉ được cancel ở trạng thái hợp lệ.

BR-12:

Notification failure không rollback Order.

---

# 14. API STANDARD

Response success:

{
  "success": true,
  "message": "Success",
  "data": {}
}

Response error:

{
  "success": false,
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "timestamp": "..."
}

HTTP status sử dụng đúng:

200
201
204
400
401
403
404
409
422
500

Mỗi service phải có:

- DTO.
- Validation.
- Global Exception Handler.
- Consistent response.

Không expose JPA Entity trực tiếp nếu không cần.

---

# 15. API CORE

## Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

---

## Product

GET /api/products

GET /api/products/{id}

POST /api/products

PUT /api/products/{id}

DELETE /api/products/{id}

---

## Cart

GET /api/cart

POST /api/cart/items

PUT /api/cart/items/{id}

DELETE /api/cart/items/{id}

DELETE /api/cart

---

## Inventory

POST /internal/inventory/check

POST /internal/inventory/reserve

POST /internal/inventory/release

POST /internal/inventory/deduct

Internal API không expose trực tiếp ra public nếu không cần.

---

## Order

POST /api/orders

GET /api/orders

GET /api/orders/{id}

POST /api/orders/{id}/cancel

Admin:

GET /api/admin/orders

PATCH /api/admin/orders/{id}/status

---

## Payment

POST /api/payments

GET /api/payments/{id}

---

# 16. FRONTEND

Customer pages:

- Login.
- Register.
- Home.
- Product List.
- Product Detail.
- Cart.
- Checkout.
- Order List.
- Order Detail.
- Profile.

Admin pages:

- Dashboard.
- Product Management.
- Category Management.
- Inventory Management.
- Order Management.
- User Management.

Frontend phải có:

- Loading.
- Error.
- Empty state.
- Form validation.
- Protected route.
- Role-based route.
- JWT handling.
- Responsive cơ bản.

Không cần UI quá phức tạp.

---

# 17. DOCUMENTATION REQUIREMENTS

Tạo thư mục:

docs/

Bao gồm:

01-introduction.md
02-business-analysis.md
03-requirements.md
04-use-cases.md
05-bpmn.md
06-architecture.md
07-microservices.md
08-database-design.md
09-api-design.md
10-security.md
11-testing.md
12-deployment.md
13-demo.md
14-conclusion.md

Ngoài ra:

architecture-decision-records.md
traceability-matrix.md
defense-questions.md
demo-checklist.md
final-review.md

---

# 18. REQUIRED DIAGRAMS

Phải có:

1. System Context Diagram.
2. Use Case Diagram.
3. High-Level Architecture.
4. Microservices Architecture.
5. Deployment Diagram.
6. ERD.
7. Class Diagram.
8. Login Sequence Diagram.
9. Checkout Sequence Diagram.
10. Payment Sequence Diagram.
11. Notification Sequence Diagram.

BPMN:

1. Registration/Login.
2. Product Management.
3. Shopping Cart.
4. Checkout.
5. Payment.
6. Order Fulfillment.

Diagram phải khớp code.

---

# 19. TESTING REQUIREMENTS

Tối thiểu phải test:

Authentication:

- Register success.
- Duplicate email.
- Login success.
- Wrong password.

Product:

- Create.
- Update.
- Delete.
- Search.
- Not found.

Cart:

- Add.
- Update.
- Remove.
- Empty cart.

Inventory:

- Check stock.
- Reserve.
- Release.
- Out of stock.

Order:

- Create success.
- Out of stock.
- Cancel.
- Get order.

Payment:

- Success.
- Failed.

Notification:

- Consume event.

---

# 20. DOCKER

Root phải có:

docker-compose.yml

Các thành phần:

- frontend
- gateway
- eureka
- auth-service
- product-service
- cart-service
- inventory-service
- order-service
- payment-service
- notification-service
- mysql
- rabbitmq

Có thể dùng một MySQL container nhưng phải tạo logical database riêng cho từng service.

---

# 21. CONFIGURATION

Sử dụng environment variables.

Ví dụ:

DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD

RABBITMQ_HOST
RABBITMQ_USERNAME
RABBITMQ_PASSWORD

JWT_SECRET

Tạo:

.env.example

Không commit:

.env

---

# 22. PROJECT STRUCTURE

Mục tiêu:

ecommerce-microservices/

├── gateway/
├── eureka-server/
├── auth-service/
├── product-service/
├── cart-service/
├── inventory-service/
├── order-service/
├── payment-service/
├── notification-service/
│
├── frontend/
│
├── docs/
│
├── postman/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md

---

# 23. CODING RULES

Code phải:

- Clean.
- Readable.
- Maintainable.
- Compile được.
- Run được.
- Có error handling.
- Có validation.
- Có logging.
- Có DTO.
- Có service layer.
- Có repository layer.
- Có controller layer.

Không:

- TODO cho core feature.
- Pseudo-code.
- Hard-code credentials.
- Copy database giữa service.
- Query database service khác.
- Tạo abstraction không cần thiết.
- Over-engineering.

---

# 24. LAYERED ARCHITECTURE

Mỗi backend service ưu tiên:

controller
    |
    v
service
    |
    v
repository
    |
    v
database

DTO:

request DTO
response DTO

Entity chỉ dùng bên trong service.

---

# 25. LOGGING

Log:

- Important business event.
- Error.
- Service communication.
- Order flow.
- Payment flow.

Không log:

- Password.
- JWT đầy đủ.
- Sensitive credentials.

---

# 26. OBSERVABILITY

Tối thiểu:

- Spring Boot Actuator.
- Health check.
- Application logging.

Optional:

- Prometheus.
- Grafana.

Không triển khai nếu làm project quá phức tạp.

---

# 27. SEED DATA

Tạo:

Admin:

admin@example.com

Customer:

customer@example.com

Categories:

- Smartphone
- Laptop
- Headphone
- Accessories

Ít nhất 10 products.

Có inventory tương ứng.

---

# 28. DEMO SCENARIO

Demo chính:

1. Admin login.
2. Admin tạo product.
3. Customer login.
4. Customer xem product.
5. Add to cart.
6. Checkout.
7. Inventory check.
8. Reserve stock.
9. Mock payment success.
10. Order confirmed.
11. RabbitMQ publish event.
12. Notification consume event.
13. Customer xem order.

Demo failure:

1. Customer checkout.
2. Inventory reserve.
3. Payment failed.
4. Release inventory.
5. Order PAYMENT_FAILED.

---

# 29. DEFINITION OF DONE

Feature chỉ được coi là DONE nếu:

[ ] Code hoàn thành.

[ ] Build thành công.

[ ] Không có compile error.

[ ] Unit test phù hợp.

[ ] API test được.

[ ] Error case được xử lý.

[ ] Documentation cập nhật.

[ ] Diagram cập nhật nếu architecture thay đổi.

[ ] Swagger cập nhật.

[ ] Không có TODO quan trọng.

[ ] Có thể chạy local.

[ ] Không phá vỡ feature cũ.

---

# 30. AI AGENT BEHAVIOR

ĐÂY LÀ QUY TẮC QUAN TRỌNG NHẤT.

AI Agent KHÔNG được:

- Code toàn bộ project trong một lần.
- Tự nhảy qua phase.
- Tự thay đổi architecture lớn mà không ghi nhận.
- Tự thêm technology không cần thiết.
- Xóa code cũ nếu chưa kiểm tra.
- Giả vờ test thành công.
- Giả vờ Docker chạy thành công.
- Nói "completed" khi chưa kiểm chứng.

AI Agent PHẢI:

1. Đọc overview.
2. Đọc phase instruction.
3. Inspect repository.
4. Phân tích hiện trạng.
5. Lập plan.
6. Implement.
7. Build.
8. Test.
9. Fix.
10. Update documentation.
11. Báo cáo kết quả.
12. Chỉ chuyển phase khi phase hiện tại đạt Definition of Done.

---

# 31. CHANGE MANAGEMENT

Nếu phát hiện cần thay đổi architecture:

Không tự thay đổi âm thầm.

Phải ghi:

## Proposed Change

### Current

...

### Proposed

...

### Reason

...

### Impact

...

### Decision

...

Cập nhật:

docs/architecture-decision-records.md

nếu thay đổi có ảnh hưởng kiến trúc.

---

# 32. FINAL QUALITY BAR

Trước khi tuyên bố project hoàn thành:

Kiểm tra:

Architecture
Business Logic
Database
API
Security
Messaging
Testing
Frontend
Docker
Documentation
Demo

Đặc biệt phải đảm bảo:

Requirement
    ↓
Use Case
    ↓
BPMN
    ↓
Architecture
    ↓
API
    ↓
Code
    ↓
Database
    ↓
Test Case

tất cả nhất quán.

---

# 33. FINAL PRINCIPLE

Không cần tạo hệ thống giống production 100%.

Mục tiêu là tạo một hệ thống:

- Đúng nghiệp vụ.
- Đúng kiến trúc Microservices.
- Chạy được.
- Demo được.
- Có tài liệu.
- Có test.
- Có thể giải thích.
- Có thể bảo vệ.

Ưu tiên chất lượng hơn số lượng code.
