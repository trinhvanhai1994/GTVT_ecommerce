import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { to: "/admin", end: true, label: "Tổng quan", hint: "GMV · doanh thu shop" },
  { to: "/admin/shops", label: "Gian hàng", hint: "Duyệt · quản lý" },
  { to: "/admin/customers", label: "Khách hàng", hint: "Tài khoản mua hàng" }
];

const TITLES = {
  "/admin": "Tổng quan sàn",
  "/admin/shops": "Quản lý gian hàng",
  "/admin/customers": "Khách hàng"
};

function NavIcon({ id }) {
  const common = { width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 1.75 };
  if (id === "shops") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...common}>
        <path d="M4 10 12 4l8 6v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9Z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === "customers") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
        <path d="M16 11h5M18.5 8.5v5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...common}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function navIconId(to) {
  if (to === "/admin/shops") return "shops";
  if (to === "/admin/customers") return "customers";
  return "home";
}

export default function PlatformShell({ user, mobileNavOpen, onToggleMobileNav }) {
  const location = useLocation();
  const onShopDetail = /^\/admin\/shops\/\d+/.test(location.pathname);
  const path = location.pathname;
  const title = onShopDetail
    ? "Chi tiết gian hàng"
    : path.startsWith("/admin/shops")
      ? TITLES["/admin/shops"]
      : path.startsWith("/admin/customers")
        ? TITLES["/admin/customers"]
        : TITLES["/admin"];

  return (
    <div className="platform-layout">
      <button
        type="button"
        className="platform-nav-toggle btn btn-sm"
        onClick={onToggleMobileNav}
        aria-expanded={mobileNavOpen}
      >
        Menu điều hướng
      </button>
      <section className="platform-shell dash-theme-platform">
        <aside className={`platform-sidebar ${mobileNavOpen ? "open" : ""}`}>
          <div className="platform-brand">
            <span className="platform-admin-logo">N</span>
            <div className="platform-brand-text">
              <strong>Nava Platform</strong>
              <span>{user?.fullName || "Quản trị viên"}</span>
            </div>
          </div>
          <p className="platform-nav-label">Điều hướng</p>
          <nav className="platform-nav" aria-label="Quản trị sàn">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  if (item.to === "/admin/shops" && (isActive || onShopDetail)) return "on";
                  return isActive ? "on" : "";
                }}
                onClick={() => onToggleMobileNav?.(false)}
              >
                <span className="platform-nav-icon">
                  <NavIcon id={navIconId(item.to)} />
                </span>
                <span className="platform-nav-copy">
                  {item.label}
                  <small>{item.hint}</small>
                </span>
              </NavLink>
            ))}
          </nav>
          <div className="platform-sidebar-foot">
            <span>Quản trị sàn · v1</span>
          </div>
        </aside>
        <div className="platform-main">
          <header className="platform-page-head">
            <p className="platform-eyebrow">Nava · Platform Console</p>
            <h1>{title}</h1>
          </header>
          <div className="platform-body">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  );
}
