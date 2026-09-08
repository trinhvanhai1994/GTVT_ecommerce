# Defense questions (30+)

1. Microservices khác monolith ở điểm nào?
2. Vì sao đồ án chọn microservices?
3. Bounded context trong hệ thống này là gì?
4. API Gateway làm gì? Frontend có được gọi thẳng service không?
5. Eureka giải quyết vấn đề gì? Vì sao default tắt trên máy local?
6. Database per service nghĩa là gì?
7. Vì sao không FK `orders.user_id` sang `users`?
8. Sync vs async ở đâu trong golden path?
9. OpenFeign dùng khi nào?
10. RabbitMQ dùng khi nào? Vì sao notification không dùng REST đồng bộ?
11. Saga là gì? Khác 2PC thế nào?
12. Compensation khi payment fail xảy ra ra sao?
13. Reserve khác deduct thế nào?
14. Làm sao tránh oversell?
15. Order item snapshot giá để làm gì?
16. JWT chứa gì? Secret lấy từ đâu?
17. Customer lấy cart user khác được không?
18. BR-12: notification fail có rollback order không?
19. Internal API vì sao không expose Gateway?
20. CORS đặt ở đâu?
21. Eventual consistency thể hiện chỗ nào?
22. Idempotency còn thiếu gì?
23. Scale inventory độc lập được không?
24. Failure của Inventory giữa reserve và payment xử lý thế nào?
25. COD vs MOCK_CARD trong mock payment?
26. Actuator dùng để demo gì?
27. Swagger đặt trên từng service vì sao?
28. Docker Compose phụ thuộc Postgres host vì sao (ADR-010)?
29. Common module có phá microservices không?
30. Test H2 khác production PostgreSQL ra sao?
31. Cancel order trạng thái nào hợp lệ?
32. Gateway JWT vs service JWT?
33. Làm sao demo 8 phút cho hội đồng?
34. NFR nào cố ý không production-grade?
35. Nếu product price đổi sau khi item nằm trong cart thì sao?
