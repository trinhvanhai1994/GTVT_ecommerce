import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ErrorBoundary from "./ErrorBoundary.jsx";

export default function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart() || { count: 0 };
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const search = (e) => {
    e.preventDefault();
    const next = q.trim();
    navigate(next ? `/products?keyword=${encodeURIComponent(next)}` : "/products");
    setOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className={location.pathname.startsWith("/admin") ? "header-inner admin-header" : "header-inner"}>
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">N</span>
            <span>
              Nava
              <small>Cửa hàng công nghệ</small>
            </span>
          </Link>

          {!location.pathname.startsWith("/admin") && (
            <form className="header-search" onSubmit={search}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm điện thoại, laptop, tai nghe..."
                aria-label="Tìm sản phẩm"
              />
              <button type="submit">Tìm</button>
            </form>
          )}

          <button className="menu-btn" type="button" onClick={() => setOpen(!open)} aria-label="Menu">
            Menu
          </button>

          <nav className={open ? "main-nav open" : "main-nav"}>
            <NavLink to="/products" onClick={() => setOpen(false)}>
              Sản phẩm
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <NavLink to="/orders" onClick={() => setOpen(false)}>
                Đơn hàng
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setOpen(false)}>
                Quản trị
              </NavLink>
            )}
            {isAuthenticated && !isAdmin && (
              <NavLink to="/cart" className="cart-link" onClick={() => setOpen(false)}>
                Giỏ hàng
                {count > 0 && <span className="badge">{count}</span>}
              </NavLink>
            )}
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" onClick={() => setOpen(false)}>
                  {user?.fullName?.split(" ").slice(-1)[0]}
                </NavLink>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                >
                  Thoát
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  Đăng nhập
                </NavLink>
                <NavLink to="/register" className="btn btn-sm" onClick={() => setOpen(false)}>
                  Tạo tài khoản
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className={location.pathname.startsWith("/admin") ? "content wide" : "content"}>
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <strong>Nava</strong>
            <p>Cửa hàng điện tử một quầy — giao hàng toàn quốc, đổi trả 7 ngày.</p>
          </div>
          <div>
            <strong>Hỗ trợ</strong>
            <p>Hotline 1900 0000 · 8:00–21:00</p>
          </div>
          <div>
            <strong>Thanh toán</strong>
            <p>COD · Thẻ demo · Chuyển khoản demo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
