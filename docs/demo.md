# docs/demo.md — 7–10 minute script

1. Architecture slide: Frontend → Gateway → services; DB per service; RabbitMQ.
2. Admin creates/lists product.
3. Customer login, browse, add to cart, checkout SUCCESS.
4. Show order CONFIRMED + inventory down.
5. Second checkout with simulate failure → PAYMENT_FAILED + stock restored.
6. Open RabbitMQ management or notification logs.
7. Q&A: why no 2PC, why JWT at services, why mock payment.
