# Chương 5 — BPMN / Quy trình nghiệp vụ

Tất cả quy trình bám **Golden Path** và **Failure Path** trong `00-OVERVIEW.md` / `02-business-analysis.md`.

---

## BPMN-01 — Registration / Login

### Mục tiêu

Khách hàng hoặc admin xác thực để nhận JWT.

### Diagram

```mermaid
flowchart TD
  Start([Start]) --> Open[Open Login or Register]
  Open --> Choice{Has account?}
  Choice -->|No| Register[Submit registration]
  Register --> ValR{Valid and email unique?}
  ValR -->|No| ErrR[Show validation or duplicate error]
  ErrR --> Register
  ValR -->|Yes| Hash[Hash password and create CUSTOMER]
  Hash --> LoginForm[Go to Login]
  Choice -->|Yes| Login[Submit email and password]
  LoginForm --> Login
  Login --> ValL{Credentials valid?}
  ValL -->|No| ErrL[401 INVALID_CREDENTIALS]
  ErrL --> Login
  ValL -->|Yes| JWT[Issue JWT with role]
  JWT --> End([Authenticated session])
```

### Ghi chú

- Password không log, không trả về client.
- Role trong token: `CUSTOMER` hoặc `ADMIN`.

---

## BPMN-02 — Product Management

### Mục tiêu

Admin quản lý category và product. Customer chỉ đọc.

```mermaid
flowchart TD
  Start([Start]) --> Auth{JWT role?}
  Auth -->|CUSTOMER or anonymous| Read[List / Search / Detail products]
  Read --> EndRead([Catalog displayed])
  Auth -->|ADMIN| Action{Action}
  Action --> Cat[CRUD Category]
  Action --> Prod[CRUD Product]
  Cat --> SaveC[Persist in product_db]
  Prod --> SaveP[Persist in product_db]
  SaveC --> EndAdmin([Catalog updated])
  SaveP --> EndAdmin
  Auth -->|Missing or invalid| Deny[401 / 403]
```

---

## BPMN-03 — Shopping Cart

```mermaid
flowchart TD
  Start([Start]) --> Login{Customer logged in?}
  Login -->|No| Auth[401 Unauthorized]
  Login -->|Yes| Load[Load cart by userId]
  Load --> Op{Operation}
  Op --> Add[Add item]
  Op --> Upd[Update quantity]
  Op --> Rem[Remove item]
  Op --> Clr[Clear cart]
  Op --> View[View cart]
  Add --> Valid{Product exists and qty > 0?}
  Valid -->|No| Err[400 / 404]
  Valid -->|Yes| Merge[Insert or increase quantity]
  Upd --> Own{Item belongs to user?}
  Rem --> Own
  Own -->|No| Forbid[403 / 404]
  Own -->|Yes| Apply[Apply change]
  Merge --> Save[Save cart_db]
  Apply --> Save
  Clr --> Save
  View --> Done([Return cart])
  Save --> Done
```

---

## BPMN-04 — Checkout (Golden Path + Inventory + Payment)

Đây là quy trình quan trọng nhất. Phải thể hiện:

Customer → Cart → Order → Inventory → Payment → Order → Notification

và failure path: Payment Failed → Release Inventory → Order PAYMENT_FAILED.

```mermaid
flowchart TD
  Start([Customer clicks Checkout]) --> Cart[Load cart]
  Cart --> Empty{Cart empty?}
  Empty -->|Yes| StopEmpty[Reject BR-05]
  Empty -->|No| Ship[Collect shipping and payment method]
  Ship --> Create[Order Service creates order PENDING with item snapshots]
  Create --> Check[Inventory: check stock]
  Check --> Enough{Enough stock?}
  Enough -->|No| StopStock[Reject BR-06 / BR-07]
  Enough -->|Yes| Reserve[Inventory: reserve stock]
  Reserve --> PendPay[Order status PAYMENT_PENDING]
  PendPay --> Pub1[Publish ORDER_CREATED best-effort]
  Pub1 --> Pay[Payment Service mock charge]
  Pay --> Result{Payment result}
  Result -->|SUCCESS| Confirm[Order CONFIRMED]
  Confirm --> Deduct[Inventory: deduct reserved]
  Deduct --> Clear[Clear cart]
  Clear --> Pub2[Publish PAYMENT_SUCCESS and ORDER_CONFIRMED]
  Pub2 --> NotifOk[Notification Service consumes]
  NotifOk --> EndOk([Customer sees confirmed order])
  Result -->|FAILED| Release[Inventory: release reserved]
  Release --> FailOrd[Order PAYMENT_FAILED]
  FailOrd --> Pub3[Publish PAYMENT_FAILED]
  Pub3 --> NotifFail[Notification Service consumes]
  NotifFail --> EndFail([Customer sees payment failed])
```

### Compensation

```
Payment FAILED
  → Release Inventory
  → Order = PAYMENT_FAILED
```

Notification lỗi **không** rollback order (BR-12).

---

## BPMN-05 — Payment

```mermaid
flowchart TD
  Start([Payment requested]) --> Create[Create payment PENDING]
  Create --> Method{Method}
  Method --> COD[COD]
  Method --> Card[MOCK_CARD]
  Method --> Bank[MOCK_BANKING]
  COD --> Mock[Mock processor]
  Card --> Mock
  Bank --> Mock
  Mock --> Outcome{Simulated outcome}
  Outcome -->|SUCCESS| Ok[Status SUCCESS]
  Outcome -->|FAILED| Bad[Status FAILED]
  Ok --> TellOk[Notify Order Service]
  Bad --> TellBad[Notify Order Service]
  TellOk --> EndOk([Order confirms])
  TellBad --> EndBad([Order compensates])
```

Không tích hợp cổng thanh toán thật.

---

## BPMN-06 — Order Fulfillment

```mermaid
flowchart TD
  Start([Order CONFIRMED]) --> Admin[Admin opens order management]
  Admin --> Proc[Set PROCESSING]
  Proc --> Ship[Set SHIPPING]
  Ship --> PubS[Publish ORDER_SHIPPED]
  PubS --> Deliv[Set DELIVERED]
  Deliv --> PubD[Publish ORDER_DELIVERED]
  PubD --> Notif[Notification consumes]
  Notif --> End([Customer tracks status])

  StartCancel([Customer cancel request]) --> Can{Status PENDING or PAYMENT_PENDING?}
  Can -->|Yes| Rel[Release stock if reserved]
  Rel --> Canc[Set CANCELLED]
  Can -->|No| Reject[409 ORDER_NOT_CANCELLABLE]
```

---

## Ánh xạ BPMN → Use Case / FR

| BPMN | Use Cases | FR |
|------|-----------|----|
| BPMN-01 | UC-01, UC-02 | FR-01, FR-02 |
| BPMN-02 | UC-03, UC-04, UC-11 | FR-03, FR-04, FR-05, FR-13, FR-14 |
| BPMN-03 | UC-05 | FR-06 |
| BPMN-04 | UC-06, UC-07, UC-08, UC-14 | FR-07, FR-08, FR-09, FR-15, FR-17 |
| BPMN-05 | UC-08 | FR-09 |
| BPMN-06 | UC-09, UC-10, UC-13, UC-14 | FR-10, FR-11, FR-12, FR-16, FR-17 |
