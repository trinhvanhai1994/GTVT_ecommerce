# AI CODING AGENT — 4 PHASE IMPLEMENTATION PLAN

> IMPORTANT:
>
> AI Agent PHẢI đọc `00-OVERVIEW.md` trước.
>
> AI Agent chỉ được triển khai PHASE được yêu cầu.
>
> Không được tự động triển khai Phase tiếp theo.
>
> Sau mỗi Phase phải:
>
> 1. Build.
> 2. Test.
> 3. Review.
> 4. Update documentation.
> 5. Report.
>
> Chỉ khi Phase hiện tại đạt Definition of Done mới được đề xuất chuyển Phase tiếp theo.

---

# GLOBAL WORKFLOW

Mỗi Phase phải thực hiện:

ANALYZE
    ↓
PLAN
    ↓
IMPLEMENT
    ↓
BUILD
    ↓
TEST
    ↓
FIX
    ↓
DOCUMENT
    ↓
REVIEW
    ↓
REPORT

Không được:

ANALYZE → CODE → DONE

---

# PHASE 1
# BUSINESS ANALYSIS + SYSTEM DESIGN + PROJECT FOUNDATION

## Objective

Hoàn thành toàn bộ:

- Business Analysis.
- Requirement Analysis.
- Use Case.
- Business Rules.
- BPMN.
- Architecture.
- Database Design.
- API Design.
- Project skeleton.

PHASE 1 CHƯA cần hoàn thành toàn bộ business feature.

Mục tiêu là tạo nền móng chính xác trước khi code lớn.

---

## 1.1 Inspect Repository

Trước tiên:

- Kiểm tra repository hiện tại.
- Kiểm tra file hiện có.
- Kiểm tra branch.
- Kiểm tra Java.
- Kiểm tra Node.
- Kiểm tra Docker.
- Kiểm tra database.
- Kiểm tra project structure.

Nếu project trống:

Tạo structure.

Nếu project đã có code:

Không được xóa code tùy tiện.

Phải tạo:

docs/current-state.md

---

# 1.2 Business Analysis

Tạo:

docs/01-introduction.md

docs/02-business-analysis.md

docs/03-requirements.md

Phân tích:

- Business problem.
- Target users.
- Stakeholders.
- Customer.
- Admin.
- Business goals.
- System scope.
- Out of scope.

---

# 1.3 Actors

Xác định:

ACTOR-01 Customer

ACTOR-02 Admin

ACTOR-03 Payment System

ACTOR-04 Notification System

ACTOR-05 Service/System Infrastructure

Giải thích vai trò từng actor.

---

# 1.4 Functional Requirements

Tạo danh sách:

FR-01 Register
FR-02 Login
FR-03 View Products
FR-04 Search Products
FR-05 View Product Detail
FR-06 Manage Cart
FR-07 Checkout
FR-08 Create Order
FR-09 Payment
FR-10 View Order
FR-11 Cancel Order
FR-12 Track Order
FR-13 Manage Products
FR-14 Manage Categories
FR-15 Manage Inventory
FR-16 Manage Orders
FR-17 Send Notification

---

# 1.5 Non-functional Requirements

Phân tích:

NFR-01 Security
NFR-02 Performance
NFR-03 Availability
NFR-04 Maintainability
NFR-05 Scalability
NFR-06 Reliability
NFR-07 Usability

Không đặt requirement phi thực tế.

---

# 1.6 Use Case

Tạo:

docs/04-use-cases.md

Phải có:

- Use Case List.
- Use Case Diagram.
- Use Case Specification.

Tối thiểu:

UC-01 Register
UC-02 Login
UC-03 Browse Product
UC-04 Search Product
UC-05 Manage Cart
UC-06 Checkout
UC-07 Create Order
UC-08 Payment
UC-09 View Order
UC-10 Cancel Order
UC-11 Manage Product
UC-12 Manage Inventory
UC-13 Manage Order
UC-14 Notification

Mỗi Use Case:

- ID.
- Name.
- Actor.
- Description.
- Preconditions.
- Trigger.
- Main Flow.
- Alternative Flow.
- Exception Flow.
- Postcondition.
- Business Rules.

---

# 1.7 BPMN

Tạo:

docs/05-bpmn.md

Diagrams:

1. Login.
2. Product Management.
3. Shopping Cart.
4. Checkout.
5. Payment.
6. Order Fulfillment.

Đặc biệt:

Checkout BPMN phải thể hiện:

Customer
→ Cart
→ Order
→ Inventory
→ Payment
→ Order
→ Notification

Failure path:

Payment Failed
→ Release Inventory
→ Payment Failed Order.

---

# 1.8 Architecture

Tạo:

docs/06-architecture.md

docs/07-microservices.md

Phân tích:

- Monolith.
- Microservices.
- Lý do chọn Microservices.
- Bounded Context.
- Service boundaries.
- API Gateway.
- Eureka.
- RabbitMQ.
- Database per Service.
- Saga.

---

# 1.9 Architecture Diagram

Tạo:

docs/diagrams/

system-context.mmd

architecture.mmd

deployment.mmd

---

# 1.10 Database Design

Tạo:

docs/08-database-design.md

Thiết kế:

auth_db
product_db
cart_db
inventory_db
order_db
payment_db
notification_db

Mô tả:

- Table.
- Column.
- Type.
- PK.
- Index.
- Unique.
- Nullable.
- Relationship.

Tạo:

erd.mmd

---

# 1.11 API Design

Tạo:

docs/09-api-design.md

Mô tả:

- Endpoint.
- HTTP method.
- Request.
- Response.
- Authentication.
- Authorization.
- Error.

---

# 1.12 Project Skeleton

Tạo:

gateway
eureka-server
auth-service
product-service
cart-service
inventory-service
order-service
payment-service
notification-service
frontend

Chỉ tạo skeleton.

Không cần hoàn thành business logic.

---

# 1.13 Infrastructure Skeleton

Tạo:

docker-compose.yml

Cho:

- MySQL.
- RabbitMQ.

Nếu phù hợp có thể chuẩn bị Eureka/Gateway.

---

# 1.14 Postman Structure

Tạo:

postman/

ecommerce.postman_collection.json

Có folder:

Auth
Product
Cart
Inventory
Order
Payment
Admin

Có thể để request placeholder nếu API chưa implement.

---

# 1.15 Phase 1 Documentation

Tạo:

docs/implementation-plan.md

docs/architecture-decision-records.md

docs/traceability-matrix.md

---

# PHASE 1 DEFINITION OF DONE

[ ] Business analysis completed.

[ ] Functional requirements completed.

[ ] Non-functional requirements completed.

[ ] Actors completed.

[ ] Use Cases completed.

[ ] BPMN completed.

[ ] Architecture completed.

[ ] Database design completed.

[ ] API design completed.

[ ] Project structure created.

[ ] Architecture diagrams created.

[ ] No major architecture ambiguity.

[ ] Documentation internally consistent.

[ ] Project skeleton builds successfully.

---

# PHASE 1 FINAL REPORT

Sau khi hoàn thành trả:

## PHASE 1 REPORT

### Completed

...

### Documents Created

...

### Architecture

...

### Services

...

### Database

...

### APIs

...

### Build Result

...

### Test Result

...

### Issues

...

### Architecture Decisions

...

### Ready For Phase 2

YES / NO

Không tự động chuyển sang Phase 2.

---

# PHASE 2
# CORE BACKEND + INFRASTRUCTURE

## Objective

Implement toàn bộ backend core:

- Eureka.
- Gateway.
- Auth.
- Product.
- Cart.
- Inventory.
- Order.
- Payment.
- Notification.
- RabbitMQ.
- Security.
- Database.

Phase này phải đạt backend end-to-end.

---

# 2.1 Infrastructure

Implement:

Eureka Server.

API Gateway.

RabbitMQ.

MySQL.

Docker configuration.

Kiểm tra service registration.

---

# 2.2 Auth Service

Implement:

- Register.
- Login.
- JWT.
- BCrypt.
- Role.
- Profile.

Database:

users.

Test:

- Register success.
- Duplicate email.
- Login success.
- Wrong password.
- Unauthorized API.

---

# 2.3 Product Service

Implement:

- Product CRUD.
- Category CRUD.
- Search.
- Pagination.
- Filter.

Authorization:

ADMIN.

Customer:

Read only.

Test đầy đủ.

---

# 2.4 Cart Service

Implement:

- Get cart.
- Add item.
- Update item.
- Remove item.
- Clear cart.

Validate:

- Product exists.
- Quantity > 0.

---

# 2.5 Inventory Service

Implement:

- Check stock.
- Reserve stock.
- Release stock.
- Deduct stock.

Phải tránh:

availableQuantity < 0

Test:

- Enough stock.
- Not enough stock.
- Reserve.
- Release.

---

# 2.6 Order Service

Implement:

- Create order.
- Order items.
- Get orders.
- Get order detail.
- Cancel order.
- Update order status.

Integrate:

Order
→ Inventory.

---

# 2.7 Payment Service

Implement Mock Payment.

Support:

SUCCESS

FAILED

Create payment record.

---

# 2.8 RabbitMQ

Implement:

Producer:

Order Service.

Consumer:

Notification Service.

Events:

ORDER_CREATED
PAYMENT_SUCCESS
PAYMENT_FAILED
ORDER_CONFIRMED

---

# 2.9 Notification Service

Implement:

- RabbitMQ consumer.
- Notification persistence.
- Console log.

Notification failure không được phá Order transaction.

---

# 2.10 Saga

Implement flow:

Create Order
→ Reserve Inventory
→ Payment
→ Confirm Order

Failure:

Payment Failed
→ Release Inventory
→ Order PAYMENT_FAILED

---

# 2.11 Security

Implement:

JWT validation.

Role authorization.

Customer resource ownership.

Admin authorization.

---

# 2.12 Swagger

Implement OpenAPI cho các service.

---

# 2.13 Backend Tests

Unit test:

- Auth.
- Product.
- Cart.
- Inventory.
- Order.
- Payment.

Integration test nếu phù hợp.

---

# 2.14 Phase 2 Documentation

Update:

docs/06-architecture.md

docs/08-database-design.md

docs/09-api-design.md

docs/10-security.md

docs/11-testing.md

docs/architecture-decision-records.md

---

# PHASE 2 DEFINITION OF DONE

[ ] Eureka works.

[ ] Gateway works.

[ ] Auth works.

[ ] JWT works.

[ ] Product works.

[ ] Cart works.

[ ] Inventory works.

[ ] Order works.

[ ] Payment works.

[ ] RabbitMQ works.

[ ] Notification works.

[ ] Saga flow works.

[ ] Database works.

[ ] Swagger works.

[ ] Unit tests pass.

[ ] Backend builds.

[ ] Docker configuration validated.

[ ] No critical TODO.

---

# PHASE 2 FINAL REPORT

## PHASE 2 REPORT

### Services Completed

...

### APIs

...

### Database

...

### Authentication

...

### RabbitMQ

...

### Saga

...

### Tests

...

### Build

...

### Known Issues

...

### Ready For Phase 3

YES / NO

Không tự động chuyển Phase 3.

---

# PHASE 3
# FRONTEND + END-TO-END INTEGRATION

## Objective

Xây dựng frontend React và tích hợp toàn bộ backend thành hệ thống demo hoàn chỉnh.

---

# 3.1 Frontend Setup

Implement:

React
Vite
React Router
Axios

Structure rõ ràng:

components/
pages/
services/
hooks/
context/
utils/

---

# 3.2 Authentication UI

Pages:

Login.

Register.

Profile.

Implement:

JWT.

Protected routes.

Role-based routes.

---

# 3.3 Customer UI

Implement:

Home.

Product List.

Product Detail.

Search.

Filter.

Pagination.

---

# 3.4 Cart UI

Implement:

View Cart.

Add Product.

Update Quantity.

Remove Product.

Clear Cart.

---

# 3.5 Checkout UI

Implement:

Shipping information.

Order summary.

Payment method.

Confirm order.

Payment result.

---

# 3.6 Order UI

Implement:

Order List.

Order Detail.

Order Status.

Cancel Order.

---

# 3.7 Admin UI

Implement:

Dashboard.

Product Management.

Category Management.

Inventory Management.

Order Management.

User Management.

---

# 3.8 API Integration

Frontend gọi:

API Gateway.

Không gọi trực tiếp từng microservice.

Flow:

Frontend
→ Gateway
→ Service

---

# 3.9 Error Handling

Frontend phải xử lý:

401.

403.

404.

409.

500.

Network error.

Loading.

Empty data.

---

# 3.10 End-to-End Flow

Test:

Customer:

Login
→ Product
→ Cart
→ Checkout
→ Payment
→ Order.

Verify:

Inventory changed.

Order status changed.

Payment created.

RabbitMQ event generated.

Notification generated.

---

# 3.11 Failure Flow

Test:

Checkout
→ Reserve stock
→ Payment FAILED
→ Release stock
→ Order PAYMENT_FAILED.

Verify inventory được trả lại.

---

# 3.12 Demo Data

Seed:

1 Admin.

2 Customers.

10+ Products.

Categories.

Inventory.

---

# 3.13 UI Quality

Không cần quá đẹp.

Nhưng phải:

- Consistent.
- Responsive.
- Easy to understand.
- Easy to demo.
- Không broken UI.

---

# 3.14 Phase 3 Documentation

Update:

docs/13-demo.md

README.md

docs/11-testing.md

docs/12-deployment.md

---

# PHASE 3 DEFINITION OF DONE

[ ] Login works.

[ ] Register works.

[ ] Product page works.

[ ] Search works.

[ ] Cart works.

[ ] Checkout works.

[ ] Payment success works.

[ ] Payment failure works.

[ ] Order works.

[ ] Inventory works.

[ ] Notification works.

[ ] Admin works.

[ ] JWT works.

[ ] Protected routes work.

[ ] Frontend builds.

[ ] Backend + Frontend integration works.

[ ] Golden Path demo works.

[ ] Failure Path demo works.

---

# PHASE 3 FINAL REPORT

## PHASE 3 REPORT

### Frontend

...

### Customer Flow

...

### Admin Flow

...

### E2E Test

...

### Success Scenario

...

### Failure Scenario

...

### UI Issues

...

### Build

...

### Ready For Phase 4

YES / NO

Không tự động chuyển Phase 4.

---

# PHASE 4
# TESTING + DOCKER + DOCUMENTATION + FINAL SUBMISSION

## Objective

Đây là phase hoàn thiện.

Mục tiêu:

- Full testing.
- Docker.
- Documentation.
- Report.
- Demo.
- Defense preparation.
- Final review.

---

# 4.1 Full Build

Build toàn bộ:

Backend.

Frontend.

Docker images.

Không được có:

compile error.

---

# 4.2 Full Test

Tạo tối thiểu 30 test cases.

Authentication.

Product.

Cart.

Inventory.

Order.

Payment.

Notification.

Admin.

Security.

Integration.

---

# 4.3 Postman

Hoàn thiện:

ecommerce.postman_collection.json

Có:

Auth.

Product.

Cart.

Inventory.

Order.

Payment.

Admin.

---

# 4.4 Docker

Hoàn thiện:

Dockerfile.

docker-compose.yml.

.env.example.

Kiểm tra:

docker compose up

Kiểm tra tất cả service.

---

# 4.5 Health Check

Kiểm tra:

Eureka.

Gateway.

Auth.

Product.

Cart.

Inventory.

Order.

Payment.

Notification.

RabbitMQ.

MySQL.

Frontend.

---

# 4.6 Documentation

Hoàn thiện:

docs/01-introduction.md

docs/02-business-analysis.md

docs/03-requirements.md

docs/04-use-cases.md

docs/05-bpmn.md

docs/06-architecture.md

docs/07-microservices.md

docs/08-database-design.md

docs/09-api-design.md

docs/10-security.md

docs/11-testing.md

docs/12-deployment.md

docs/13-demo.md

docs/14-conclusion.md

---

# 4.7 Architecture Decision Records

Hoàn thiện:

docs/architecture-decision-records.md

Ít nhất:

ADR-001 Microservices.

ADR-002 Database per Service.

ADR-003 API Gateway.

ADR-004 Eureka.

ADR-005 RabbitMQ.

ADR-006 Mock Payment.

ADR-007 Saga.

---

# 4.8 Traceability Matrix

Hoàn thiện:

Requirement
→ Use Case
→ BPMN
→ API
→ Service
→ Database
→ Test

Ví dụ:

FR-07 Checkout
→ UC-06 Checkout
→ BPMN-04
→ POST /api/orders
→ Order Service
→ orders/order_items
→ TC-ORDER-001

---

# 4.9 Defense Questions

Tạo:

docs/defense-questions.md

Ít nhất 30 câu hỏi.

Phải giải thích được:

- Microservices.
- Monolith.
- API Gateway.
- Eureka.
- RabbitMQ.
- REST.
- Synchronous.
- Asynchronous.
- Database per Service.
- Saga.
- Compensation.
- JWT.
- Security.
- Transaction.
- Eventual consistency.
- Scaling.
- Failure handling.

---

# 4.10 Demo Script

Tạo:

docs/demo.md

Demo khoảng:

7–10 phút.

Golden Path:

Admin
→ Create Product
→ Customer Login
→ Product
→ Cart
→ Checkout
→ Inventory
→ Payment SUCCESS
→ Order CONFIRMED
→ RabbitMQ
→ Notification

Failure Path:

Checkout
→ Inventory Reserve
→ Payment FAILED
→ Release Stock
→ Order PAYMENT_FAILED

---

# 4.11 Report

Chuẩn bị báo cáo khoảng:

30–40 trang.

Structure:

CHƯƠNG 1
GIỚI THIỆU

CHƯƠNG 2
PHÂN TÍCH NGHIỆP VỤ

CHƯƠNG 3
QUY TRÌNH NGHIỆP VỤ

CHƯƠNG 4
KIẾN TRÚC MICROSERVICES

CHƯƠNG 5
THIẾT KẾ VÀ TRIỂN KHAI

CHƯƠNG 6
KIỂM THỬ VÀ DEMO

CHƯƠNG 7
KẾT LUẬN

Không viết nội dung không tồn tại trong implementation.

---

# 4.12 README

README phải có:

- Overview.
- Architecture.
- Services.
- Technology.
- Requirements.
- Installation.
- Environment.
- Docker.
- Database.
- RabbitMQ.
- Run.
- Test.
- Swagger.
- Demo account.
- Demo scenario.
- Troubleshooting.

---

# 4.13 Final Review

Tạo:

docs/final-review.md

Review:

## Architecture

Có đúng Microservices không?

## Business

Business flow có đúng không?

## Database

Có database per service không?

## Security

JWT có đúng không?

## Messaging

RabbitMQ có hoạt động không?

## Transaction

Saga/compensation có hoạt động không?

## Code

Có TODO quan trọng không?

## Testing

Có test core business không?

## Deployment

Docker có chạy không?

## Documentation

Tài liệu có khớp code không?

---

# 4.14 Final Checklist

[ ] Source code builds.

[ ] Frontend builds.

[ ] Docker builds.

[ ] Docker compose starts.

[ ] Eureka works.

[ ] Gateway works.

[ ] Auth works.

[ ] Product works.

[ ] Cart works.

[ ] Inventory works.

[ ] Order works.

[ ] Payment works.

[ ] RabbitMQ works.

[ ] Notification works.

[ ] Admin works.

[ ] Customer works.

[ ] Success payment works.

[ ] Failed payment works.

[ ] Stock compensation works.

[ ] Swagger works.

[ ] Postman works.

[ ] Tests pass.

[ ] Documentation complete.

[ ] BPMN complete.

[ ] Diagrams complete.

[ ] Report complete.

[ ] Demo script complete.

[ ] Defense questions complete.

---

# PHASE 4 DEFINITION OF DONE

Project chỉ được tuyên bố FINAL khi:

[ ] Full build passed.

[ ] Full test passed.

[ ] Docker startup passed.

[ ] Golden Path passed.

[ ] Failure Path passed.

[ ] Documentation completed.

[ ] Report completed.

[ ] Demo completed.

[ ] Defense preparation completed.

[ ] No critical blocker.

---

# FINAL REPORT

Sau khi hoàn thành:

# FINAL PROJECT REPORT

## 1. Project Overview

...

## 2. Architecture

...

## 3. Services

...

## 4. Database

...

## 5. API

...

## 6. Security

...

## 7. RabbitMQ

...

## 8. Saga

...

## 9. Frontend

...

## 10. Testing

...

## 11. Docker

...

## 12. Documentation

...

## 13. Demo

...

## 14. Known Limitations

...

## 15. Future Improvements

...

## 16. Final Status

READY FOR SUBMISSION / NOT READY

---

# ABSOLUTE RULE

AI Agent KHÔNG được tự động chuyển Phase.

Khi Phase hoàn thành:

Chỉ trả report.

Không bắt đầu Phase tiếp theo.

Chỉ bắt đầu Phase tiếp theo khi user yêu cầu rõ:

"IMPLEMENT PHASE 2"

hoặc:

"START PHASE 2"

Tương tự:

"IMPLEMENT PHASE 3"

"IMPLEMENT PHASE 4"

---

# END
