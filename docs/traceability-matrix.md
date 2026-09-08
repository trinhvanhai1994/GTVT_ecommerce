# Traceability Matrix

| Requirement | Use Case | BPMN | API | Service | Database | Test |
|-------------|----------|------|-----|---------|----------|------|
| FR-01 Register | UC-01 | BPMN-01 | POST /api/auth/register | AUTH-SERVICE | auth_db.users | TC-AUTH-001 |
| FR-02 Login | UC-02 | BPMN-01 | POST /api/auth/login, GET /api/auth/profile | AUTH-SERVICE | auth_db.users | TC-AUTH-003 |
| FR-03 View Products | UC-03 | BPMN-02 | GET /api/products | PRODUCT-SERVICE | product_db.products | TC-PROD-004 |
| FR-04 Search Products | UC-04 | BPMN-02 | GET /api/products?keyword= | PRODUCT-SERVICE | product_db.products | TC-PROD-004 |
| FR-05 View Product Detail | UC-03 | BPMN-02 | GET /api/products/{id} | PRODUCT-SERVICE | product_db.products | TC-PROD-005 |
| FR-06 Manage Cart | UC-05 | BPMN-03 | /api/cart, /api/cart/items | CART-SERVICE | cart_db.carts, cart_items | TC-CART-001 |
| FR-07 Checkout | UC-06 | BPMN-04 | POST /api/orders | ORDER-SERVICE | order_db.orders | TC-ORDER-001, E2E-GOLDEN |
| FR-08 Create Order | UC-07 | BPMN-04 | POST /api/orders | ORDER-SERVICE | orders, order_items | TC-ORDER-001 |
| FR-09 Payment | UC-08 | BPMN-05 | POST /internal/payments | PAYMENT-SERVICE | payment_db.payments | TC-PAY-001 |
| FR-10 View Order | UC-09 | BPMN-06 | GET /api/orders, GET /api/orders/{id} | ORDER-SERVICE | order_db.orders | TC-ORDER-004 |
| FR-11 Cancel Order | UC-10 | BPMN-06 | POST /api/orders/{id}/cancel | ORDER-SERVICE | order_db.orders | TC-ORDER-003 |
| FR-12 Track Order | UC-09 | BPMN-06 | GET /api/orders/{id} | ORDER-SERVICE | orders.status | TC-ORDER-004 |
| FR-13 Manage Products | UC-11 | BPMN-02 | POST/PUT/DELETE /api/products | PRODUCT-SERVICE | products | TC-PROD-001 |
| FR-14 Manage Categories | UC-11 | BPMN-02 | /api/products/categories | PRODUCT-SERVICE | categories | TC-PROD-001 |
| FR-15 Manage Inventory | UC-12 | BPMN-04 | /internal/inventory/*, /api/inventory | INVENTORY-SERVICE | inventories | TC-INV-001 |
| FR-16 Manage Orders | UC-13 | BPMN-06 | /api/admin/orders | ORDER-SERVICE | orders | TC-ORDER-004 |
| FR-17 Send Notification | UC-14 | BPMN-04/06 | RabbitMQ events | NOTIFICATION-SERVICE | notifications | TC-NOTI-001 |
| BR-05 Empty cart | UC-06 | BPMN-04 | POST /api/orders | ORDER-SERVICE | carts | TC-CART-004 |
| BR-06/07 Stock | UC-07, UC-12 | BPMN-04 | /internal/inventory/check,reserve | INVENTORY-SERVICE | inventories | TC-INV-002 |
| BR-08/09 Payment saga | UC-08 | BPMN-04/05 | payments + reserve/release | ORDER, PAYMENT, INVENTORY | orders, payments, inventories | TC-PAY-001/002, E2E-FAIL |
| BR-10 Snapshot | UC-07 | BPMN-04 | POST /api/orders | ORDER-SERVICE | order_items | TC-ORDER-001 |
| BR-11 Cancel rules | UC-10 | BPMN-06 | POST /api/orders/{id}/cancel | ORDER-SERVICE | orders | TC-ORDER-003 |
| BR-12 Notif isolation | UC-14 | BPMN-04 | events | NOTIFICATION-SERVICE | notifications | TC-NOTI-001 |
| NFR-01 Security | UC-02 | BPMN-01 | JWT on protected APIs | Gateway, Auth | users | TC-AUTH-005 |
|-------------|----------|------|-----|---------|----------|--------------|
| FR-01 Register | UC-01 | BPMN-01 | POST /api/auth/register | AUTH-SERVICE | auth_db.users | TC-AUTH-001 |
| FR-02 Login | UC-02 | BPMN-01 | POST /api/auth/login, GET /api/auth/profile | AUTH-SERVICE | auth_db.users | TC-AUTH-003 |
| FR-03 View Products | UC-03 | BPMN-02 | GET /api/products | PRODUCT-SERVICE | product_db.products | TC-PROD-004 |
| FR-04 Search Products | UC-04 | BPMN-02 | GET /api/products?keyword= | PRODUCT-SERVICE | product_db.products | TC-PROD-004 |
| FR-05 View Product Detail | UC-03 | BPMN-02 | GET /api/products/{id} | PRODUCT-SERVICE | product_db.products | TC-PROD-005 |
| FR-06 Manage Cart | UC-05 | BPMN-03 | /api/cart, /api/cart/items | CART-SERVICE | cart_db.carts, cart_items | TC-CART-001 |
| FR-07 Checkout | UC-06 | BPMN-04 | POST /api/orders | ORDER-SERVICE | order_db.orders | TC-ORDER-001 |
| FR-08 Create Order | UC-07 | BPMN-04 | POST /api/orders | ORDER-SERVICE | orders, order_items | TC-ORDER-001 |
| FR-09 Payment | UC-08 | BPMN-05 | POST /api/payments | PAYMENT-SERVICE | payment_db.payments | TC-PAY-001 |
| FR-10 View Order | UC-09 | BPMN-06 | GET /api/orders, GET /api/orders/{id} | ORDER-SERVICE | order_db.orders | TC-ORDER-004 |
| FR-11 Cancel Order | UC-10 | BPMN-06 | POST /api/orders/{id}/cancel | ORDER-SERVICE | order_db.orders | TC-ORDER-003 |
| FR-12 Track Order | UC-09 | BPMN-06 | GET /api/orders/{id} | ORDER-SERVICE | orders.status | TC-ORDER-004 |
| FR-13 Manage Products | UC-11 | BPMN-02 | POST/PUT/DELETE /api/products | PRODUCT-SERVICE | products | TC-PROD-001 |
| FR-14 Manage Categories | UC-11 | BPMN-02 | /api/products/categories | PRODUCT-SERVICE | categories | TC-PROD-001 |
| FR-15 Manage Inventory | UC-12 | BPMN-04 | /internal/inventory/*, /api/inventory | INVENTORY-SERVICE | inventories | TC-INV-001 |
| FR-16 Manage Orders | UC-13 | BPMN-06 | /api/admin/orders | ORDER-SERVICE | orders | TC-ORDER-004 |
| FR-17 Send Notification | UC-14 | BPMN-04/06 | RabbitMQ events | NOTIFICATION-SERVICE | notifications | TC-NOTI-001 |
| BR-05 Empty cart | UC-06 | BPMN-04 | POST /api/orders | ORDER-SERVICE | carts | TC-CART-004 |
| BR-06/07 Stock | UC-07, UC-12 | BPMN-04 | /internal/inventory/check,reserve | INVENTORY-SERVICE | inventories | TC-INV-002 |
| BR-08/09 Payment saga | UC-08 | BPMN-04/05 | payments + reserve/release | ORDER, PAYMENT, INVENTORY | orders, payments, inventories | TC-PAY-001/002 |
| BR-10 Snapshot | UC-07 | BPMN-04 | POST /api/orders | ORDER-SERVICE | order_items | TC-ORDER-001 |
| BR-11 Cancel rules | UC-10 | BPMN-06 | POST /api/orders/{id}/cancel | ORDER-SERVICE | orders | TC-ORDER-003 |
| BR-12 Notif isolation | UC-14 | BPMN-04 | events | NOTIFICATION-SERVICE | notifications | TC-NOTI-001 |
| NFR-01 Security | UC-02 | BPMN-01 | JWT on protected APIs | Gateway, Auth | users | TC-AUTH-005 |
