# Tài liệu đồ án — Hệ thống Nava (Marketplace Microservices)

Package: `gtvt.haitv.ecommerce` · Spring Boot 3 + Spring Cloud + React (Vite).

## Bộ báo cáo chính (nộp / bảo vệ)

| Thứ tự | File | Mô tả |
|--------|------|--------|
| — | [`../BAO-CAO-DO-AN.md`](../BAO-CAO-DO-AN.md) | **Nguồn gốc** — chỉnh sửa tại đây |
| — | [`BAO-CAO-FULL.md`](./BAO-CAO-FULL.md) | Bản mirror trong `docs/` |
| — | [`INDEX-BAO-CAO.md`](./INDEX-BAO-CAO.md) | Chỉ mục chương `bao-cao/` |
| 0 | [`00-bia-muc-luc.md`](./00-bia-muc-luc.md) | Bìa, mục lục, thuật ngữ |
| 1 | [`01-introduction.md`](./01-introduction.md) | Tổng quan hệ thống |
| 2 | [`02-business-analysis.md`](./02-business-analysis.md) | Vấn đề & phạm vi MVP |
| 3 | [`03-requirements.md`](./03-requirements.md) | Tác nhân, FR, Storefront |
| 4 | [`04-use-cases.md`](./04-use-cases.md) | → tham chiếu mục 3 |
| 5 | [`05-bpmn.md`](./05-bpmn.md) | Quy trình nghiệp vụ |
| 6 | [`06-architecture.md`](./06-architecture.md) | Kiến trúc + UI 5.6 |
| 6b | [`06-design-diagrams.md`](./06-design-diagrams.md) | Biểu đồ thiết kế (mục 6) |
| 7 | [`07-data-and-api.md`](./07-data-and-api.md) | CSDL logical + API |
| 7r | [`07-microservices.md`](./07-microservices.md) | → tham chiếu mục 5 |
| 8–9 | [`08-database-design.md`](./08-database-design.md), [`09-api-design.md`](./09-api-design.md) | → tham chiếu mục 7 |
| 10 | [`10-security.md`](./10-security.md) | JWT, role (bổ sung) |
| 11 | [`11-testing.md`](./11-testing.md) | Kiểm thử & checklist UI |
| 12 | [`12-deployment.md`](./12-deployment.md) | Docker / triển khai |
| 13 | [`13-demo.md`](./13-demo.md) | Kịch bản demo |
| 14 | [`14-conclusion.md`](./14-conclusion.md) | Kết luận |
| PL | [`defense-questions.md`](./defense-questions.md) | Q&A bảo vệ |

Thư mục [`bao-cao/`](./bao-cao/) — **11 file** tách chương (có front matter YAML).

Thống kê nguồn: **29** bảng, **16** sơ đồ Mermaid.

## Xuất Word (DOCX)

```bash
cd GTVT_ecommerce
python3 scripts/build_docs_from_bao_cao.py
python3 scripts/build_bao_cao_docx.py
# → BAO-CAO-DO-AN.docx (Mermaid → PNG, Pandoc, TOC)
```

## Vận hành & demo nhanh

- [`DEMO-MARKETPLACE.md`](./DEMO-MARKETPLACE.md) — tài khoản, checklist
- [`12-deployment.md`](./12-deployment.md), [`15-spring-cloud-luong-chay-va-config.md`](./15-spring-cloud-luong-chay-va-config.md)
- [`../README.md`](../README.md) — chạy project

## Tài liệu phase (lịch sử triển khai)

`00-OVERVIEW.md`, `01-PHASES.md`, `phase-*-report.md`, `implementation-plan.md` — hướng dẫn agent / phase 1–4 ban đầu (single-store). **Không thay thế báo cáo marketplace.**

## Sơ đồ `.mmd`

Thư mục [`diagrams/`](./diagrams/) — bản Mermaid tách (login, checkout, ERD, …). Báo cáo chính nhúng Mermaid inline trong `BAO-CAO-DO-AN.md`.

---

*Cập nhật tự động: `python3 scripts/build_docs_from_bao_cao.py`*
