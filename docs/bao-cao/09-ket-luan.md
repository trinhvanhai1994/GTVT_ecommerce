---
source: BAO-CAO-DO-AN.md
generated_by: scripts/build_docs_from_bao_cao.py
generated_on: 2026-10-22
chapter_id: 09-ket-luan
title: # 9. Kết luận
do_not_edit: Regenerate with `python3 scripts/build_docs_from_bao_cao.py`
---

# 9. Kết luận

Đồ án xây **Nava** — marketplace nhiều gian hàng theo **Microservices** (MVP): đăng ký / duyệt shop, Home list shop, mua trong shop (list SP theo `shopId`), giỏ group shop, checkout split Order + Saga, giá VND.

Tám business service (+ Gateway, Eureka): nổi bật **`shop-service`** (SoT gian hàng) và **`order-service`** (Saga Orchestrator). Database per service; `shopId` logical xuyên context.

Tài liệu đủ để thuyết trình nghiệp vụ và kiến trúc. Lộ trình go-live (migration schema, idempotent Saga, Outbox, HA DB/MQ, observability) tóm tắt tại **mục 5.7** — không đổi thiết kế bounded context hiện tại.

Các tính năng sàn nâng cao (chat, livestream, tìm toàn sàn, ví thật) nằm ngoài phạm vi MVP.

---
