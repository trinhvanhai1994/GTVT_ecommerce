import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ErrorBoundary from "./ErrorBoundary.jsx";
import ChatPanel from "./ChatPanel.jsx";

export default function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart() || { count: 0 };
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");

  // Sync search state with URL keyword param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQ(params.get("keyword") || "");
  }, [location.search]);

  // Scroll to top immediately whenever route or query params change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.search]);

  const isAdminView = location.pathname.startsWith("/admin");
  const isAuthView = location.pathname === "/login" || location.pathname === "/register";

  const search = (e) => {
    e.preventDefault();
    const next = q.trim();
    navigate(next ? `/products?keyword=${encodeURIComponent(next)}` : "/products");
  };

  return (
    <div className="app-shell">
      {!isAdminView && !isAuthView && (
        <header className="header" id="customer-header">
          <div className="header-left">
            <Link to="/" className="brand">
              <span className="brand-mark"><i className="fa-solid fa-microchip"></i></span>
              <span>NEXORA TECH</span>
            </Link>

            <NavLink
              to="/products?keyword=laptop"
              className={({ isActive }) =>
                isActive && location.search.includes("laptop") ? "nav-link active" : "nav-link"
              }
            >
              Laptop
            </NavLink>
            <NavLink
              to="/products?keyword=phone"
              className={({ isActive }) =>
                isActive && location.search.includes("phone") ? "nav-link active" : "nav-link"
              }
            >
              Điện thoại
            </NavLink>
            <NavLink
              to="/products?keyword=audio"
              className={({ isActive }) =>
                isActive && location.search.includes("audio") ? "nav-link active" : "nav-link"
              }
            >
              Audio
            </NavLink>
            <NavLink
              to="/products?keyword=gaming"
              className={({ isActive }) =>
                isActive && location.search.includes("gaming") ? "nav-link active" : "nav-link"
              }
            >
              Gaming
            </NavLink>
          </div>

          <form className="header-search" onSubmit={search}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm sản phẩm, hãng, model (MacBook, Dell, Asus...)"
              aria-label="Tìm sản phẩm"
            />
            {q && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQ("")}
                title="Xóa tìm kiếm"
                aria-label="Xóa"
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            )}
          </form>

          <div className="header-actions">
            <div className="action" onClick={() => navigate("/products")}>
              <i className="fa-solid fa-grip"></i>
              <span>Sản phẩm</span>
            </div>

            {isAuthenticated && !isAdmin && (
              <div className="action" onClick={() => navigate("/orders")}>
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>Đơn hàng</span>
              </div>
            )}

            {isAdmin && (
              <div className="action" onClick={() => navigate("/admin")}>
                <i className="fa-solid fa-chart-line"></i>
                <span>Quản trị</span>
              </div>
            )}

            <div className="action" onClick={() => navigate("/cart")}>
              <i className="fa-solid fa-bag-shopping"></i>
              <span>Giỏ hàng</span>
              {count > 0 && <span className="action-badge">{count}</span>}
            </div>

            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link to="/profile" className="action" style={{ padding: "4px 8px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--blue-soft)",
                      color: "var(--blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "13px"
                    }}
                  >
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span>{user?.fullName?.split(" ").slice(-1)[0] || "Tôi"}</span>
                </Link>
                <button
                  type="button"
                  className="btn soft"
                  style={{ minHeight: "36px", padding: "0 12px", fontSize: "12px" }}
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  title="Đăng xuất"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link to="/login" className="btn soft" style={{ minHeight: "38px", padding: "0 14px" }}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn primary" style={{ minHeight: "38px", padding: "0 14px" }}>
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="main-content">
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      {!isAdminView && !isAuthView && (
        <>
          <ChatPanel />
          <footer className="site-footer">
            <div className="footer-grid">
              <div className="footer-col">
                <div className="brand" style={{ color: "#fff", marginBottom: "14px" }}>
                  NEXORA TECH
                </div>
                <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", maxWidth: "340px" }}>
                  Hệ thống phân phối điện tử, laptop mỏng nhẹ, gaming và workstation chính hãng. Trải nghiệm mua sắm
                  thông minh, giao hàng siêu tốc 2H và hậu mãi tận tâm.
                </p>
                <div style={{ display: "flex", gap: "12px", marginTop: "18px", color: "#a6c7ff" }}>
                  <i className="fa-brands fa-facebook fa-lg"></i>
                  <i className="fa-brands fa-youtube fa-lg"></i>
                  <i className="fa-brands fa-tiktok fa-lg"></i>
                </div>
              </div>

              <div className="footer-col">
                <h4>Sản phẩm</h4>
                <div className="footer-links">
                  <Link to="/products?keyword=laptop">Laptop Doanh Nhân</Link>
                  <Link to="/products?keyword=gaming">Laptop Gaming</Link>
                  <Link to="/products?keyword=apple">Apple MacBook M4</Link>
                  <Link to="/products?keyword=audio">Tai nghe & Loa cao cấp</Link>
                  <Link to="/products">Linh kiện & Phụ kiện</Link>
                </div>
              </div>

              <div className="footer-col">
                <h4>Chính sách</h4>
                <div className="footer-links">
                  <Link to="/orders">Chính sách bảo hành 24T</Link>
                  <Link to="/orders">Đổi trả 1-1 trong 7 ngày</Link>
                  <Link to="/checkout">Giao hàng hỏa tốc 2H</Link>
                  <Link to="/checkout">Hướng dẫn trả góp 0%</Link>
                  <Link to="/profile">Bảo mật thông tin</Link>
                </div>
              </div>

              <div className="footer-col">
                <h4>Tổng đài hỗ trợ</h4>
                <div className="footer-links">
                  <span style={{ color: "#fff", fontWeight: "700", fontSize: "16px" }}>
                    <i className="fa-solid fa-phone" style={{ marginRight: "8px", color: "#60a5fa" }}></i>
                    1800 6868
                  </span>
                  <span>Tư vấn mua hàng: 8:00 - 21:30</span>
                  <span>Khiếu nại & Bảo hành: 8:30 - 18:00</span>
                  <span>Email: support@nexoratech.vn</span>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div>© 2026 NEXORA TECH. All rights reserved.</div>
              <div style={{ display: "flex", gap: "20px" }}>
                <span>Điều khoản sử dụng</span>
                <span>Chính sách thanh toán</span>
                <span>Hệ thống cửa hàng</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
