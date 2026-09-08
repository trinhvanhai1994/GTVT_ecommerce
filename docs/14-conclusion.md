# Chương 14 — Kết luận

Đồ án đã triển khai e-commerce microservices chạy được end-to-end: identity, catalog, cart, inventory, order saga, mock payment, async notification, React UI qua API Gateway.

Hạn chế: mock payment, PostgreSQL local thay MySQL (ADR-010), Eureka opt-in, `/internal` tin tưởng network, không có service mesh.

Hướng phát triển: idempotent consumers, outbox, API gateway JWT, Docker Postgres riêng, observability.
