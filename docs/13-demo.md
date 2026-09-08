# Chương 13 — Demo

Thời lượng ~8 phút.

## Tài khoản

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Password123 |
| Customer | customer@example.com | Password123 |
| Customer 2 | customer2@example.com | Password123 |

UI: http://localhost:5173  
API: http://localhost:8080

## Golden Path (success)

1. Admin login → Products tab → optionally create a product.
2. Admin Inventory → confirm stock for product 1.
3. Logout. Customer login.
4. Products → open detail → Add to cart.
5. Cart → Checkout. Leave **Simulate payment failure** unchecked.
6. Confirm. Order status **CONFIRMED**, payment SUCCESS.
7. Admin Inventory: available decreased.
8. RabbitMQ: message on `notification.events`. Notification service log `[MOCK EMAIL]`.

## Failure Path

1. Customer cart → Checkout.
2. Check **Simulate payment failure**.
3. Confirm. Order **PAYMENT_FAILED**.
4. Inventory available returns to previous value (compensation / release).

## Script nói

“Khách không gọi từng microservice. Browser chỉ gọi Gateway. Order Service điều phối Saga. Payment mock. Notification không nằm trong transaction đặt hàng.”
