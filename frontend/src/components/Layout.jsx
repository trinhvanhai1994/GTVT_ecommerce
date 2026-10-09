import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { countUnread, markNotificationsSeen } from "../utils/notifyRead";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { IconBell, IconCart, IconChevron, IconClose, IconMenu, IconSearch } from "./icons.jsx";

function initials(user) {
  const name = String(user?.fullName || user?.email || "?").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart() || { count: 0 };
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifyCount, setNotifyCount] = useState(0);
  const userMenuRef = useRef(null);
  const isAdminArea = location.pathname.startsWith("/admin");

  const displayName = useMemo(() => user?.fullName || user?.email || "Tài khoản", [user]);

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userOpen) return;
    const onDoc = (e) => {
      if (!userMenuRef.current?.contains(e.target)) setUserOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setUserOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setNotifyCount(0);
      return;
    }
    let cancelled = false;
    const load = () => {
      api
        .get("/notifications")
        .then((res) => {
          if (cancelled) return;
          const list = res.data.data || [];
          // Đang ở trang thông báo → coi như đã đọc hết
          if (location.pathname.startsWith("/notifications")) {
            markNotificationsSeen(list, user?.id);
            setNotifyCount(0);
          } else {
            setNotifyCount(countUnread(list, user?.id));
          }
        })
        .catch(() => {
          if (!cancelled) setNotifyCount(0);
        });
    };
    load();
    const timer = setInterval(load, 60000);
    const onSeen = () => setNotifyCount(0);
    window.addEventListener("notify:seen", onSeen);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("notify:seen", onSeen);
    };
  }, [isAuthenticated, isAdmin, location.pathname, user?.id]);

  const search = (e) => {
    e.preventDefault();
    const next = q.trim();
    navigate(next ? `/products?keyword=${encodeURIComponent(next)}` : "/products");
    setMenuOpen(false);
  };

  const doLogout = () => {
    logout();
    setUserOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const notifyLabel = notifyCount > 99 ? "99+" : String(notifyCount);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className={isAdminArea ? "header-inner admin-header" : "header-inner"}>
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">N</span>
            <span>
              Nava
              <small>Cửa hàng công nghệ</small>
            </span>
          </Link>

          {!isAdminArea && (
            <form className="header-search" onSubmit={search}>
              <span className="search-icon">
                <IconSearch />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm điện thoại, laptop, tai nghe..."
                aria-label="Tìm sản phẩm"
              />
              <button type="submit">Tìm</button>
            </form>
          )}

          <div className="header-tools">
            <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Điều hướng chính">
              {!isAdminArea && (
                <NavLink to="/products" onClick={() => setMenuOpen(false)}>
                  Sản phẩm
                </NavLink>
              )}
              {isAuthenticated && !isAdmin && (
                <NavLink to="/orders" onClick={() => setMenuOpen(false)}>
                  Đơn hàng
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                  Quản trị
                </NavLink>
              )}
            </nav>

            <div className="header-actions">
              {isAuthenticated && !isAdmin && (
                <>
                  <Link
                    to="/notifications"
                    className="icon-btn"
                    aria-label={notifyCount > 0 ? `Thông báo chưa đọc (${notifyCount})` : "Thông báo"}
                    title="Thông báo"
                    onClick={() => {
                      setMenuOpen(false);
                      setNotifyCount(0);
                      api
                        .get("/notifications")
                        .then((res) => markNotificationsSeen(res.data.data || [], user?.id))
                        .catch(() => {});
                    }}
                  >
                    <IconBell />
                    {notifyCount > 0 && <span className="badge">{notifyLabel}</span>}
                  </Link>
                  <Link
                    to="/cart"
                    className="icon-btn"
                    aria-label={count > 0 ? `Giỏ hàng (${count})` : "Giỏ hàng"}
                    title="Giỏ hàng"
                    onClick={() => setMenuOpen(false)}
                  >
                    <IconCart />
                    {count > 0 && <span className="badge">{count > 99 ? "99+" : count}</span>}
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <div className={`user-menu ${userOpen ? "open" : ""}`} ref={userMenuRef}>
                  <button
                    type="button"
                    className="avatar-btn"
                    aria-haspopup="menu"
                    aria-expanded={userOpen}
                    onClick={() => setUserOpen((v) => !v)}
                  >
                    <span className="avatar-circle">{initials(user)}</span>
                    <span className="avatar-meta">
                      <span className="avatar-name">{displayName.split(" ").slice(-1)[0]}</span>
                      <span className="avatar-role">{isAdmin ? "Admin" : "Khách"}</span>
                    </span>
                    <IconChevron />
                  </button>
                  {userOpen && (
                    <div className="user-dropdown" role="menu">
                      <div className="user-dropdown-head">
                        <strong>{displayName}</strong>
                        <span>{user?.email}</span>
                      </div>
                      <Link role="menuitem" to="/profile" onClick={() => setUserOpen(false)}>
                        Hồ sơ của tôi
                      </Link>
                      {!isAdmin && (
                        <>
                          <Link role="menuitem" to="/orders" onClick={() => setUserOpen(false)}>
                            Đơn hàng
                          </Link>
                          <Link
                            role="menuitem"
                            to="/notifications"
                            onClick={() => {
                              setUserOpen(false);
                              setNotifyCount(0);
                              api
                                .get("/notifications")
                                .then((res) => markNotificationsSeen(res.data.data || [], user?.id))
                                .catch(() => {});
                            }}
                          >
                            Thông báo
                            {notifyCount > 0 && <em>{notifyLabel}</em>}
                          </Link>
                          <Link role="menuitem" to="/cart" onClick={() => setUserOpen(false)}>
                            Giỏ hàng
                            {count > 0 && <em>{count}</em>}
                          </Link>
                        </>
                      )}
                      {isAdmin && (
                        <Link role="menuitem" to="/admin" onClick={() => setUserOpen(false)}>
                          Bảng quản trị
                        </Link>
                      )}
                      <button type="button" role="menuitem" className="danger" onClick={doLogout}>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-actions">
                  <NavLink to="/login" className="nav-text" onClick={() => setMenuOpen(false)}>
                    Đăng nhập
                  </NavLink>
                  <NavLink to="/register" className="btn btn-sm" onClick={() => setMenuOpen(false)}>
                    Tạo tài khoản
                  </NavLink>
                </div>
              )}

              <button
                className="menu-btn icon-btn"
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <IconClose /> : <IconMenu />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className={isAdminArea ? "content wide" : "content"}>
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
            <p className="tiny">
              <Link to="/forgot-password">Quên mật khẩu</Link>
              {!isAdmin && isAuthenticated && (
                <>
                  {" · "}
                  <Link to="/notifications">Thông báo đơn</Link>
                </>
              )}
            </p>
          </div>
          <div>
            <strong>Thanh toán &amp; email</strong>
            <p>COD · Thẻ demo · Chuyển khoản demo</p>
            <p className="tiny">Email xác nhận đơn và cập nhật trạng thái tự động.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
