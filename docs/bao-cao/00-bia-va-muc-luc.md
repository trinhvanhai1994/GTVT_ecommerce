---
source: BAO-CAO-DO-AN.md
generated_by: scripts/build_docs_from_bao_cao.py
generated_on: 2026-10-22
chapter_id: 00-bia-va-muc-luc
title: Bìa và mục lục
do_not_edit: Regenerate with `python3 scripts/build_docs_from_bao_cao.py`
---

# BÁO CÁO ĐỒ ÁN

**Tên đề tài**

Xây dựng hệ thống e-commerce dạng marketplace (nhiều shop)  
theo kiến trúc Microservices với Spring Boot + Spring Cloud

| Mục | Nội dung |
|-----|----------|
| Sinh viên | Trịnh Văn Hải |
| Mã SV / lớp | *(điền)* |
| Giảng viên hướng dẫn | *(điền)* |
| Công nghệ | Java 21, Spring Boot 3, Spring Cloud, PostgreSQL, RabbitMQ, React |
| Package | `gtvt.haitv.ecommerce` |
| Năm | 2026 |

> Báo cáo thiết kế System Analysis cho **sàn thương mại điện tử nhiều gian hàng (MVP)** — hệ thống **Nava**. **Bộ tài liệu nộp:** [`docs/README.md`](docs/README.md) (đồng bộ: `python3 scripts/build_docs_from_bao_cao.py`; Word: `python3 scripts/build_bao_cao_docx.py`).

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Vấn đề và phạm vi MVP](#2-vấn-đề-và-phạm-vi-mvp)
3. [Tác nhân – Chức năng – Business Rules](#3-tác-nhân--chức-năng--business-rules)
4. [Quy trình nghiệp vụ (BPMN)](#4-quy-trình-nghiệp-vụ-bpmn)
5. [Kiến trúc Microservices](#5-kiến-trúc-microservices)
6. [Biểu đồ thiết kế](#6-biểu-đồ-thiết-kế)
7. [Thiết kế dữ liệu và API](#7-thiết-kế-dữ-liệu-và-api)
8. [Kịch bản kiểm thử và thuyết minh bảo vệ](#8-kịch-bản-kiểm-thử-và-thuyết-minh-bảo-vệ)
9. [Kết luận](#9-kết-luận)
10. [Phụ lục — Q&A bảo vệ](#phụ-lục--qa-bảo-vệ)

### Ánh xạ yêu cầu đề bài → mục báo cáo

| Yêu cầu thường gặp | Mục |
|--------------------|-----|
| Hệ thống / vấn đề gì | 1, 2 |
| Tác nhân – chức năng | 3 |
| Storefront (route, API UI) | 3.5, 5.6 |
| Quy trình BPMN | 4 |
| Kiến trúc Microservices | 1, 5 |
| Triển khai production (định hướng) | 5.7, 6.3 |
| Biểu đồ tiêu biểu | 6 |
| Dữ liệu / API / kiểm thử | 7, 8 |

### Thuật ngữ

| Thuật ngữ | Nghĩa trong đồ án |
|-----------|-------------------|
| Nava | Tên sàn thương mại điện tử (Storefront) của đồ án |
| Marketplace | Sàn nhiều gian hàng; Customer chọn shop rồi mới mua hàng |
| Shop / Kênh người bán | Gian hàng; khu vực Seller quản lý shop sau khi được duyệt (Seller Center) |
| Microservice | Dịch vụ nhỏ, deploy độc lập, một Bounded context |
| API Gateway | Cổng vào duy nhất cho Storefront (`api-gateway`) |
| Service Discovery | Eureka |
| Database per service | Mỗi service một Logical database; không FK xuyên service |
| Bounded context | Ranh giới miền (Auth, Shop, Catalog, Order, …) |
| Saga / Orchestrator | Checkout do `order-service` điều phối; fail thì Compensation |
| Eventual consistency | Notification có thể đến sau Order |
| JWT / BCrypt | Xác thực; mật khẩu hash |
| Oversell | Bán vượt tồn — chống bằng reserve trước thanh toán |
| Snapshot | Lưu tên/giá SP (VND) và tên shop trên Order tại lúc đặt |
| VND | Đơn vị tiền tệ hiển thị và lưu giá sản phẩm |
| Mock payment | Thanh toán giả lập SUCCESS / FAILED (mỗi Order) |
| Reserve / Release / Deduct | Giữ hàng / hoàn tồn / trừ tồn |
| Golden Path | Luồng thành công xuyên suốt (mua trong shop + đăng ký shop) |
| Storefront | Giao diện khách (React) — thư mục `frontend/`, tên sản phẩm **Nava** |
| SPA | Single Page Application — React + Vite, điều hướng client không reload trang |
| Protected route | Route bọc `ProtectedRoute`: bắt login và/hoặc role CUSTOMER / SELLER / PLATFORM_ADMIN |
| Idempotency | Gọi lại cùng request (retry) không tạo side-effect trùng (đơn, trừ kho) |
| Transactional Outbox | Ghi event vào DB cùng transaction nghiệp vụ; worker relay sang MQ — tránh mất message |

---
