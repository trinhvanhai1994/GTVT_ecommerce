# NEXORA TECH — Design Handoff

> Source: Figma file `ZMR5leDrLAzpjZNV3lBG6J`, Website page `45:2` (`02 — Web App — Electronics`).

## 1. Purpose

This document is the implementation handoff for the NEXORA TECH electronics-commerce website. It describes the canonical Web screens, visual tokens, reusable UI patterns, interaction flow, and the expected service ownership for the Spring Boot + Spring Cloud microservice architecture.

The exported HTML is a **front-end demo/prototype**, not a production backend integration.

## 2. Canonical Website Screens

### Customer Shopping Flow

| Order | Figma node | Screen |
|---|---|---|
| 1 | `74:2` | Web / Home / Default |
| 2 | `51:121` | Web / Product / Listing Search Filter / Default |
| 3 | `51:250` | Web / Product / Product Detail / Default |
| 4 | `53:2` | Web / Cart / Default |
| 5 | `53:74` | Web / Order / Checkout Payment / Default |
| 6 | `53:151` | Web / Order / History / Default |
| 7 | `53:213` | Web / Order / Detail Tracking / Default |
| 8 | `53:291` | Web / Review / Write Review / Default |

### Authentication & Account

| Figma node | Screen |
|---|---|
| `51:2` | Login |
| `51:25` | Register |
| `51:58` | Account Management |

### Admin Operations

| Figma node | Screen |
|---|---|
| `54:2` | Admin Dashboard |
| `54:126` | Admin Products |
| `54:252` | Admin Orders |
| `54:378` | Admin Order Detail |
| `116:214` | Admin Support Inbox |

### Support

| Figma node | Screen |
|---|---|
| `116:3` | Customer Chatbox Open |
| `116:182` and equivalents | Floating Chat Launcher |

## 3. Design Tokens

### Color

| Token | Value | Usage |
|---|---|---|
| `--blue` | `#144FCC` | Brand, primary text accent, active state |
| `--blue-2` | `#144FD1` | Primary CTA |
| `--blue-soft` | `#E3EDFF` | Selected state, badge, active nav |
| `--ink` | `#0E121C` | Primary text |
| `--muted` | `#616E85` | Secondary text |
| `--line` | `#DBE3ED` | Input/card borders |
| `--surface` | `#F8F9FB` | Secondary surface |
| `--surface-2` | `#F6F8FA` | Category/brand surface |
| `--green` | `#0A7A4D` | Stock, delivery, positive state |
| `--green-soft` | `#DBF5E8` | Positive background |
| `--yellow-soft` | `#FCF0CC` | Promotion panel |
| `--danger` | `#D13333` | Delete/discount/destructive text |
| `--danger-soft` | `#FFE3E3` | Sale badge background |

### Typography

- Primary font: **Inter**
- Body: 12–15 px
- Navigation: 13–14 px
- Product title: 17 px
- Section title: 20–24 px
- Page title: 36 px
- PDP title: 38 px
- Hero title: 42 px
- Weight conventions: Regular / Semi Bold / Bold

### Radius

- Inputs: 10 px
- Buttons: 12 px
- Cards: 14–18 px
- Hero: 24 px
- Pills/tags: 999 px

### Layout

- Desktop reference width: **1440 px**
- Customer horizontal padding: **64 px**
- Main content width: **1312 px**
- Header height: **80 px**
- Product listing sidebar: **260 px**
- Product card media: **300 × 220 px**
- PDP gallery main image: **620 × 600 px**
- Standard field height: **48 px**
- Standard CTA height: **48–50 px**

## 4. Component Inventory

### Customer

- `Header`
- `Header/Search`
- `Header/Actions`
- `Hero`
- `CategoryCard`
- `TrustCard`
- `ProductCard`
- `Badge`
- `Filter/Sidebar`
- `Filter/Item`
- `ProductGallery`
- `VariantButton`
- `PromotionPanel`
- `CartItem`
- `OrderSummary`
- `ShippingOption`
- `PaymentOption`
- `OrderStatusBadge`
- `TrackingTimeline`
- `ReviewForm`
- `AccountSidebar`
- `Support/Chat Launcher`
- `Chatbox/Panel`

### Admin

- `Admin/Sidebar`
- `MetricCard`
- `RevenueChart`
- `InventoryAlert`
- `DataTable`
- `AdminFilterBar`
- `OrderInfoCard`
- `FulfillmentTimeline`
- `Support/Inbox`
- `Support/Conversation Detail`

## 5. Interaction Flow

### Primary Purchase Flow

```text
Home
→ Product Listing / Search / Filter
→ Product Detail
→ Cart
→ Checkout
→ Place Order
→ Order Tracking
→ Review
```

### Authentication

```text
Login ↔ Register
Login → Home
Account → Logout → Login
```

### Support

```text
Floating Chat Launcher
→ Chatbox
→ Product recommendation → Product Detail
→ Order lookup → Order Tracking
→ Payment question → Checkout
```

### Admin

```text
Admin Dashboard
→ Products
→ Orders
→ Order Detail
→ Support Inbox
```

## 6. Microservice Ownership

| Domain | Suggested service | Main UI areas |
|---|---|---|
| Authentication | `auth-service` | Login, Register, JWT, roles |
| User | `user-service` | Profile, delivery address |
| Product | `product-service` | Listing, search, filter, PDP, review |
| Cart | `cart-service` | Cart items, quantity |
| Order | `order-service` | Checkout, history, tracking |
| Payment | `payment-service` | COD / simulated card |
| Notification | `notification-service` | Order notifications |
| Admin Product | `product-service` | Products, category, inventory |
| Admin Order | `order-service` | Orders, fulfillment state |
| Support Chat | implementation decision required | Customer chat + Admin Support Inbox |

## 7. Recommended Front-end Route Map

```text
/
 /products
 /products/:slug
 /cart
 /checkout
 /orders
 /orders/:id
 /orders/:id/review
 /account
 /login
 /register

 /admin
 /admin/products
 /admin/orders
 /admin/orders/:id
 /admin/support
```

If implementing with ReactJS/Next.js, each route should consume shared design-system primitives rather than duplicating screen-specific CSS.

## 8. Responsive Rules

The Figma Web page is desktop-first at 1440 px. The exported HTML adds responsive behavior that is **derived for implementation/demo**, not a separate Figma Web breakpoint specification.

Recommended implementation breakpoints:

```text
Desktop: >= 1200
Laptop:  768–1199
Tablet:  480–767
Mobile:  <= 479
```

The dedicated Mobile App design should remain the source of truth for app-specific mobile UI.

## 9. State Requirements

Every data-driven screen should implement:

- Loading / skeleton
- Empty
- Network error
- Validation error
- Permission error
- Session expired
- Product out of stock
- Price changed
- Payment failed
- Order state transition conflict

Suggested semantic IDs:

```text
UI.LOADING
UI.EMPTY
UI.ERROR.NETWORK
UI.ERROR.VALIDATION
UI.ERROR.PAYMENT
UI.PERMISSION
UI.OUT_OF_STOCK
UI.PRICE_CHANGED
UI.SESSION_EXPIRED
```

Order states:

```text
PENDING_PAYMENT
PAID
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

## 10. Accessibility / UX Handoff

- Maintain visible keyboard focus on all interactive elements.
- Minimum recommended touch/click target: 44 × 44 px.
- Do not rely on color alone for order/payment states.
- Form validation must include inline error text.
- Product images require meaningful `alt`.
- Chat must preserve keyboard navigation and focus when opened/closed.
- Admin data tables need responsive fallback or horizontal scrolling on smaller screens.

## 11. HTML Export Notes

`nexora-tech-website.html` is a **single-file interactive prototype** with:

- Customer shopping flow.
- Authentication and account.
- Order history/tracking/review.
- Admin dashboard/products/orders/order detail.
- Support Inbox.
- Floating customer chat.
- Responsive CSS.
- Hash-based demo navigation.

### Asset limitation

The product images in the generated HTML currently use **temporary Figma MCP asset URLs** obtained directly from the source Figma file. Figma indicates these URLs are short-lived (approximately 7 days).

For production implementation:

1. Download the original product images from Figma while URLs are valid, or
2. Replace them with the real product CDN/API URLs.
3. Do not commit temporary `figma.com/api/mcp/asset/...` URLs to production source.

The HTML includes a visual fallback if an image URL expires.

## 12. Definition of Done for Development

A screen is implementation-ready when:

- Layout matches the canonical Figma frame.
- Shared components are reused.
- Responsive behavior is verified.
- Loading/empty/error states exist.
- API contract is connected.
- Authentication/role guards are applied.
- Form validation is implemented.
- Accessibility checks pass.
- QA can identify the matching Figma node and route.
