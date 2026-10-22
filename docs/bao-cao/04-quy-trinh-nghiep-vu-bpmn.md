---
source: BAO-CAO-DO-AN.md
generated_by: scripts/build_docs_from_bao_cao.py
generated_on: 2026-10-22
chapter_id: 04-quy-trinh-nghiep-vu-bpmn
title: # 4. Quy trình nghiệp vụ (BPMN)
do_not_edit: Regenerate with `python3 scripts/build_docs_from_bao_cao.py`
---

# 4. Quy trình nghiệp vụ (BPMN)

## 4.1 BPMN-01 — Đăng ký / Đăng nhập

```mermaid
flowchart TD
  startNode([Bat_dau]) --> hasAccount{Da_co_tai_khoan}
  hasAccount -->|Chua| register[Nhap_email_mat_khau_ho_ten]
  register --> valid{Hop_le_email_unique}
  valid -->|Khong| errReg[Bao_loi]
  errReg --> register
  valid -->|Co| createUser[Hash_BCrypt_tao_CUSTOMER]
  createUser --> login
  hasAccount -->|Roi| login[Dang_nhap]
  login --> pwdOk{Dung_mat_khau}
  pwdOk -->|Khong| err401[HTTP_401]
  err401 --> login
  pwdOk -->|Co| jwt[Cap_JWT]
  jwt --> endNode([Vao_he_thong])
```

**Đọc hình:** JWT mang `userId` + `role` (CUSTOMER / SELLER / PLATFORM_ADMIN).

## 4.2 BPMN-02 — Đăng ký shop và duyệt (trọng tâm marketplace)

**Hình 4.1 — Đăng ký & duyệt shop**

```mermaid
flowchart TD
  startReg([Bat_dau]) --> login{Da_login}
  login -->|Khong| goLogin[Dieu_huong_login]
  login -->|Co| form[Nhap_ho_so_shop]
  form --> valid{Hop_le_slug_unique}
  valid -->|Khong| err[Bao_loi]
  err --> form
  valid -->|Co| create[shop_service_tao_PENDING]
  create --> member[Tao_shop_members_OWNER]
  member --> role[Cap_role_SELLER]
  role --> wait[Cho_duyet]
  wait --> admin{PLATFORM_ADMIN}
  admin -->|Approve| ok[APPROVED_hien_Home]
  admin -->|Reject| rej[REJECTED_kem_ly_do]
  admin -->|Suspend| sus[SUSPENDED_an_Home]
  ok --> cred[auth_MK_tam_email_contactEmail]
  cred --> sellerCenter([Kenh_nguoi_ban_doi_MK])
```

**Đọc hình**

- `shop-service` tạo shop `PENDING`; chưa hiện Home; hồ sơ có `contactEmail`.
- Approve → `APPROVED` + gọi `auth-service` (mật khẩu tạm, `mustChangePassword`) + email template tới `contactEmail` (best-effort).
- Seller đăng nhập lần đầu → `/change-password` → `/seller` (dashboard merchant).
- Reject / Suspend → **không** gửi email credential; Customer không thấy shop trên Home.

## 4.3 BPMN-03 — Mua hàng trong shop (Home → shop → list SP)

**Hình 4.2 — Hành trình mua trên Storefront**

```mermaid
flowchart TD
  home([Home_list_shop]) --> pickShop[Chon_shop_APPROVED_shopId]
  pickShop --> listProd[List_SP_trong_shop]
  listProd --> filterCat{Loc_category}
  filterCat -->|Tuy_chon| listProd
  filterCat -->|Chon_SP| pdp[Chi_tiet_SP]
  pdp --> addCart{Da_login}
  addCart -->|Khong| needLogin[HTTP_401_hoac_login]
  addCart -->|Co| cart[(cart_db_group_shop)]
  cart --> checkoutNode([Checkout])
```

**Đọc hình:** Home không liệt kê SP thay shop. Vào shop theo `shopId` là thấy list SP; category là bộ lọc tùy chọn.

## 4.4 BPMN-04 — Giỏ hàng

Mỗi Customer một giỏ. Item lưu `shopId`. UI group theo shop.

```mermaid
flowchart TD
  startCart([Them_hoac_sua_gio]) --> loggedIn{Da_login}
  loggedIn -->|Khong| unauth[HTTP_401]
  loggedIn -->|Co| loadCart[Lay_cart_theo_userId]
  loadCart --> action{Thao_tac}
  action --> addItem[Them_kem_shopId]
  action --> updQty[Sua_SL]
  action --> delItem[Xoa_item]
  addItem --> prodOk{SP_thuoc_shop_APPROVED}
  prodOk -->|Khong| badReq[HTTP_400_hoac_404]
  prodOk -->|Co| save[(cart_db)]
  updQty --> save
  delItem --> save
  save --> resp([Tra_gio_group_theo_shop])
```

## 4.5 BPMN-05 — Checkout + Saga (split theo shop)

**Hình 4.3 — Checkout split N Order**

```mermaid
flowchart TD
  startCo([Bam_Checkout]) --> getCart[Lay_gio]
  getCart --> empty{Gio_rong}
  empty -->|Co| rejectEmpty[Tu_choi_BR05]
  empty -->|Khong| group[Group_item_theo_shopId]
  group --> loop[Voi_moi_shop]
  loop --> createOrd[Tao_Order_PENDING_Snapshot]
  createOrd --> checkInv[Check_ton]
  checkInv --> enough{Du_hang}
  enough -->|Khong| rejectStock[Tu_choi_shop_do]
  enough -->|Co| reserve[Reserve]
  reserve --> charge[Mock_payment]
  charge --> payResult{Ket_qua}
  payResult -->|SUCCESS| confirm[CONFIRMED_Deduct]
  confirm --> pubOk[Publish_events]
  payResult -->|FAILED| release[Release]
  release --> failOrd[PAYMENT_FAILED]
  failOrd --> pubFail[Publish_PAYMENT_FAILED]
  pubOk --> moreShop{Con_shop}
  pubFail --> moreShop
  moreShop -->|Co| loop
  moreShop -->|Khong| done([Tra_danh_sach_Order])
```

**Đọc hình**

- Một request checkout có thể tạo **nhiều Order**; mỗi Order một Saga độc lập.
- Fail một shop không bắt buộc rollback shop khác (MVP: mỗi shop xử lý riêng; báo rõ từng Order).
- `order-service` = Saga Orchestrator; không 2PC xuyên DB.

### Fulfillment (rút gọn)

Seller (hoặc Platform Admin) đổi PROCESSING → SHIPPING → DELIVERED cho Order của đúng shop; có thể publish event Notification.

---
