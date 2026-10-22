#!/usr/bin/env python3
"""Build complete thesis docs from BAO-CAO-DO-AN.md (companion to build_bao_cao_docx.py).

Outputs:
  - docs/bao-cao/*.md          — chapters with YAML front matter
  - docs/BAO-CAO-FULL.md       — full report mirror
  - docs/01-introduction.md …  — numbered files for submission
  - docs/README.md, INDEX-BAO-CAO.md, DEMO-MARKETPLACE.md, stubs for legacy paths
"""

from __future__ import annotations

import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SRC_MD = ROOT / "BAO-CAO-DO-AN.md"
OUT_DIR = DOCS / "bao-cao"
INDEX_MD = DOCS / "INDEX-BAO-CAO.md"
FULL_MD = DOCS / "BAO-CAO-FULL.md"
README_MD = DOCS / "README.md"

CHAPTER_H1 = re.compile(r"^# (\d+)\.\s+(.+)$", re.MULTILINE)
APPENDIX_H2 = re.compile(r"^## (Phụ lục.+)$", re.MULTILINE)

# (bao-cao stem, destination under docs/)
PUBLISH: list[tuple[str, str, str | None]] = [
    ("00-bia-va-muc-luc", "00-bia-muc-luc.md", None),
    ("01-tong-quan-he-thong", "01-introduction.md", None),
    ("02-van-e-va-pham-vi-mvp", "02-business-analysis.md", None),
    ("03-tac-nhan-chuc-nang-business-rules", "03-requirements.md", None),
    ("04-quy-trinh-nghiep-vu-bpmn", "05-bpmn.md", None),
    ("05-kien-truc-microservices", "06-architecture.md", None),
    ("06-bieu-o-thiet-ke", "06-design-diagrams.md", None),
    ("07-thiet-ke-du-lieu-va-api", "07-data-and-api.md", None),
    (
        "08-kich-ban-kiem-thu-va-thuyet-minh-bao-ve",
        "11-testing.md",
        "# Chương 11 — Kiểm thử và kịch bản demo\n\n"
        "> Nội dung đồng bộ từ **mục 8** báo cáo (`BAO-CAO-DO-AN.md`).\n\n",
    ),
    (
        "08-kich-ban-kiem-thu-va-thuyet-minh-bao-ve",
        "13-demo.md",
        "# Chương 13 — Demo thuyết minh (Marketplace Nava)\n\n"
        "> Kịch bản bảo vệ ~10 phút. Tài khoản: xem `DEMO-MARKETPLACE.md`.\n\n",
    ),
    ("09-ket-luan", "14-conclusion.md", None),
    (
        "10-phu-luc-q-a-bao-ve",
        "defense-questions.md",
        "# Câu hỏi bảo vệ — Phụ lục\n\n> Trích từ **Phụ lục Q&A** báo cáo đồ án.\n\n",
    ),
]

STUB_04_USE_CASES = """# Chương 4 — Use case (tham chiếu)

Use case và tác nhân đã gộp vào báo cáo **mục 3** (Customer / Seller / Platform Admin).

- File đầy đủ: [`03-requirements.md`](./03-requirements.md)
- Bản tách: [`bao-cao/03-tac-nhan-chuc-nang-business-rules.md`](./bao-cao/03-tac-nhan-chuc-nang-business-rules.md)
- Biểu đồ Use Case: [`06-design-diagrams.md`](./06-design-diagrams.md) (Hình 3.1)

*File này do `scripts/build_docs_from_bao_cao.py` tạo — không chỉnh tay.*
"""

STUB_07_MS = """# Chương 7 — Microservices (tham chiếu)

Catalog dịch vụ, port, bounded context nằm trong **mục 5** báo cáo.

- [`06-architecture.md`](./06-architecture.md) — kiến trúc + catalog 5.3 + Storefront 5.6
- [`bao-cao/05-kien-truc-microservices.md`](./bao-cao/05-kien-truc-microservices.md)

*File này do `scripts/build_docs_from_bao_cao.py` tạo — không chỉnh tay.*
"""

STUB_08_DB = """# Chương 8 — Thiết kế CSDL (tham chiếu)

Schema logical và bảng nằm trong **mục 7** báo cáo.

- [`07-data-and-api.md`](./07-data-and-api.md)
- [`bao-cao/07-thiet-ke-du-lieu-va-api.md`](./bao-cao/07-thiet-ke-du-lieu-va-api.md)

*File này do `scripts/build_docs_from_bao_cao.py` tạo — không chỉnh tay.*
"""

STUB_09_API = """# Chương 9 — Thiết kế API (tham chiếu)

Danh sách API qua Gateway nằm trong **mục 7.2** báo cáo.

- [`07-data-and-api.md`](./07-data-and-api.md)
- [`10-security.md`](./10-security.md) — JWT, role (bổ sung kỹ thuật)

*File này do `scripts/build_docs_from_bao_cao.py` tạo — không chỉnh tay.*
"""


def slugify(title: str, max_len: int = 48) -> str:
    t = title.lower().strip()
    t = unicodedata.normalize("NFKD", t)
    t = t.encode("ascii", "ignore").decode("ascii")
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return (t[:max_len].rstrip("-") or "chapter")


def split_document(text: str) -> list[tuple[str, str, str]]:
    first_ch = CHAPTER_H1.search(text)
    if not first_ch:
        raise SystemExit("No chapter headings (# N. ...) found in BAO-CAO-DO-AN.md")

    preamble = text[: first_ch.start()].strip()
    chunks: list[tuple[str, str, str]] = []
    if preamble:
        chunks.append(("00-bia-va-muc-luc", "Bìa và mục lục", preamble))

    markers: list[tuple[int, str, str, str]] = []
    for m in CHAPTER_H1.finditer(text):
        num, title = m.group(1), m.group(2).strip()
        stem = f"{int(num):02d}-{slugify(title)}"
        markers.append((m.start(), stem, f"# {num}. {title}", title))
    for m in APPENDIX_H2.finditer(text):
        title = m.group(1).strip()
        stem = f"10-{slugify(title)}"
        markers.append((m.start(), stem, f"## {title}", title))

    markers.sort(key=lambda x: x[0])
    for i, (start, stem, heading, _title) in enumerate(markers):
        end = markers[i + 1][0] if i + 1 < len(markers) else len(text)
        body = text[start:end].strip()
        chunks.append((stem, heading, body))

    return chunks


def yaml_front_matter(stem: str, heading: str) -> str:
    today = date.today().isoformat()
    return f"""---
source: BAO-CAO-DO-AN.md
generated_by: scripts/build_docs_from_bao_cao.py
generated_on: {today}
chapter_id: {stem}
title: {heading.replace('"', "'")}
do_not_edit: Regenerate with `python3 scripts/build_docs_from_bao_cao.py`
---

"""


def count_md_pipe_tables(text: str) -> int:
    table_sep = re.compile(r"^\|[-:\s|]+\|$")
    lines = text.splitlines()
    count = 0
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("|") and i + 1 < len(lines) and table_sep.match(lines[i + 1].strip()):
            count += 1
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                i += 1
            continue
        i += 1
    return count


def write_demo_marketplace() -> None:
    path = DOCS / "DEMO-MARKETPLACE.md"
    path.write_text(
        """# Demo Marketplace MVP — Nava

> Đồng bộ với mục 8 báo cáo. Chi tiết UI: `13-demo.md`, `bao-cao/08-kich-ban-kiem-thu-va-thuyet-minh-bao-ve.md`.

## Tài khoản (mật khẩu `Password123`)

| Email | Role | Ghi chú |
|-------|------|---------|
| admin@example.com | PLATFORM_ADMIN | `/admin/login` → Platform Console |
| customer@example.com | CUSTOMER | Storefront `/login` |
| seller@example.com | SELLER | `/seller/login` — owner shop seed (vd. Tech Haven) |
| seller2@example.com | SELLER | Owner shop seed thứ hai (vd. Audio Lab) |

## URL

| Thành phần | Địa chỉ |
|------------|---------|
| Storefront | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| shop-service | **8089** (admin-server giữ 8088) |

## Ba cổng đăng nhập

| Cổng | Route | Sau login |
|------|-------|-----------|
| Khách | `/login` | Home `/` |
| Người bán | `/seller/login` | `/seller` hoặc `/register-shop` |
| Quản trị sàn | `/admin/login` | `/admin` (GMV, gian hàng, khách hàng) |

## Checklist demo (~10 phút)

1. **Admin** — `/admin`: duyệt shop PENDING; xem **doanh thu theo gian hàng** (nếu đã có đơn).
2. **Home** — `/`: shop `APPROVED`.
3. **Customer** — `/shops/{shopId}` → PDP → giỏ → checkout (N shop → N Order).
4. **Seller** — `/seller`: category, SP, tồn, đơn shop; KPI `GET /orders/seller-stats`.
5. **Payment fail** — checkout + `simulatePaymentFailure` → `PAYMENT_FAILED`, release kho.
6. **Đăng ký shop mới** — `/register-shop` → PENDING → admin approve → **đăng nhập lại** seller.

## Lưu ý

- Storefront điều hướng shop bằng **`shopId`**: `/shops/{shopId}` (slug chỉ hồ sơ).
- Sau `POST /api/shops`, JWT cũ có thể vẫn CUSTOMER → **login lại**.
- `/admin/orders` redirect về `/admin` (không UI xử lý đơn toàn sàn).

*File sinh bởi `scripts/build_docs_from_bao_cao.py`.*
""",
        encoding="utf-8",
    )
    print(f"Wrote {path.relative_to(ROOT)}")


def write_readme(chunks: list[tuple[str, str, str]], table_count: int, mermaid_count: int) -> None:
    README_MD.write_text(
        f"""# Tài liệu đồ án — Hệ thống Nava (Marketplace Microservices)

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

Thống kê nguồn: **{table_count}** bảng, **{mermaid_count}** sơ đồ Mermaid.

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
""",
        encoding="utf-8",
    )
    print(f"Wrote {README_MD.relative_to(ROOT)}")


def write_index(chunks: list[tuple[str, str, str]], table_count: int, mermaid_count: int) -> None:
    lines = [
        "# Chỉ mục tài liệu — BAO-CAO-DO-AN",
        "",
        "Xem **[README.md](./README.md)** — bộ tài liệu hoàn chỉnh cho báo cáo.",
        "",
        "Nguồn gốc: [`BAO-CAO-DO-AN.md`](../BAO-CAO-DO-AN.md).",
        "",
        "## Regenerate",
        "",
        "```bash",
        "cd GTVT_ecommerce",
        "python3 scripts/build_docs_from_bao_cao.py",
        "python3 scripts/build_bao_cao_docx.py",
        "```",
        "",
        f"Thống kê: **{table_count}** bảng, **{mermaid_count}** Mermaid.",
        "",
        "## Chương (`bao-cao/`)",
        "",
        "| File | Nội dung |",
        "|------|----------|",
    ]
    for stem, heading, _ in chunks:
        lines.append(f"| [{stem}.md](./bao-cao/{stem}.md) | {heading} |")
    lines.append("")
    INDEX_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {INDEX_MD.relative_to(ROOT)}")


def publish_canonical(chunks_by_stem: dict[str, str]) -> None:
    for stem, dest, prefix in PUBLISH:
        body = chunks_by_stem.get(stem)
        if not body:
            print(f"Warning: missing stem {stem} for {dest}", file=sys.stderr)
            continue
        content = (prefix or "") + body + "\n"
        path = DOCS / dest
        path.write_text(content, encoding="utf-8")
        print(f"Published {path.relative_to(ROOT)}")

    for name, stub in [
        ("04-use-cases.md", STUB_04_USE_CASES),
        ("07-microservices.md", STUB_07_MS),
        ("08-database-design.md", STUB_08_DB),
        ("09-api-design.md", STUB_09_API),
    ]:
        path = DOCS / name
        path.write_text(stub, encoding="utf-8")
        print(f"Wrote stub {path.relative_to(ROOT)}")


def main() -> int:
    if not SRC_MD.is_file():
        print(f"Missing {SRC_MD}", file=sys.stderr)
        return 1

    raw = SRC_MD.read_text(encoding="utf-8")
    table_count = count_md_pipe_tables(raw)
    mermaid_count = len(re.findall(r"```mermaid", raw))

    FULL_MD.write_text(raw.rstrip() + "\n", encoding="utf-8")
    print(f"Wrote {FULL_MD.relative_to(ROOT)}")

    chunks = split_document(raw)
    chunks_by_stem = {stem: body for stem, _h, body in chunks}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "README.md").write_text(
        "# Báo cáo — bản tách chương\n\n"
        "Regenerate: `python3 scripts/build_docs_from_bao_cao.py`\n\n"
        "Chỉ mục: [`../README.md`](../README.md)\n",
        encoding="utf-8",
    )

    for stem, heading, body in chunks:
        path = OUT_DIR / f"{stem}.md"
        path.write_text(yaml_front_matter(stem, heading) + body + "\n", encoding="utf-8")
        print(f"Wrote {path.relative_to(ROOT)} ({len(body.splitlines())} lines)")

    publish_canonical(chunks_by_stem)
    write_demo_marketplace()
    write_index(chunks, table_count, mermaid_count)
    write_readme(chunks, table_count, mermaid_count)

    print(f"Done: {len(chunks)} chapters, full report + numbered docs in {DOCS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
