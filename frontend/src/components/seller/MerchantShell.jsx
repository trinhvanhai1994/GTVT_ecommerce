import { NavLink, Outlet, useLocation } from "react-router-dom";
import CopyShopLink from "./CopyShopLink.jsx";

const NAV = [
  { to: "/seller", end: true, id: "home", label: "Tổng quan", hint: "Dashboard & KPI" },
  { to: "/seller/orders", id: "orders", label: "Đơn hàng", hint: "Xử lý · giao hàng", badgeKey: "orders" },
  { to: "/seller/products", id: "products", label: "Sản phẩm", hint: "Catalog shop" },
  { to: "/seller/categories", id: "categories", label: "Danh mục", hint: "Nhóm SP" },
  { to: "/seller/inventory", id: "inventory", label: "Tồn kho", hint: "Số lượng bán" },
  { to: "/seller/settings", id: "settings", label: "Cài đặt", hint: "Hồ sơ gian hàng" }
];

export default function MerchantShell({ shop, openOrderCount, mobileNavOpen, onToggleMobileNav }) {
  const location = useLocation();
  const onOrderDetail = /^\/seller\/orders\/\d+/.test(location.pathname);
  const title =
    NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ||
    (onOrderDetail ? "Chi tiết đơn" : "Kênh người bán");

  return (
    <section className="merchant-shell dash-theme-merchant">
      <button type="button" className="merchant-nav-toggle btn btn-ghost" onClick={onToggleMobileNav} aria-expanded={mobileNavOpen}>
        Menu
      </button>
      <aside className={`merchant-sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="merchant-shop-card">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt="" className="merchant-shop-logo" />
          ) : (
            <span className="merchant-shop-logo placeholder">{shop.name?.slice(0, 1) || "S"}</span>
          )}
          <div>
            <strong>{shop.name}</strong>
            <span className="muted">Gian hàng đang bán</span>
          </div>
        </div>
        <nav className="merchant-nav" aria-label="Kênh người bán">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "on" : "")}
              onClick={() => onToggleMobileNav?.(false)}
            >
              {item.badgeKey && openOrderCount > 0 && item.badgeKey === "orders" && (
                <span className="nav-count">{openOrderCount}</span>
              )}
              {item.label}
              <small>{item.hint}</small>
            </NavLink>
          ))}
        </nav>
        <div className="merchant-sidebar-foot">
          <CopyShopLink shopId={shop.id} slug={shop.slug} />
        </div>
      </aside>
      <div className="merchant-main dash-main">
        <header className="dash-head merchant-head">
          <div>
            <p className="eyebrow">Kênh người bán · {shop.name}</p>
            <h1>{title}</h1>
          </div>
        </header>
        <Outlet />
      </div>
    </section>
  );
}
