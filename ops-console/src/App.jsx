import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import OverviewPage from "./pages/OverviewPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import ServiceDetailPage from "./pages/ServiceDetailPage.jsx";
import LogsPage from "./pages/LogsPage.jsx";
import DeployPage from "./pages/DeployPage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { clearCreds, fetchServices, getCreds, isAuthenticated } from "./api.js";

function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Shell() {
  const [services, setServices] = useState([]);
  const [apiError, setApiError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCreds().username;

  const loadServices = () => {
    fetchServices()
      .then((list) => {
        setServices(list || []);
        setApiError(null);
      })
      .catch((e) => setApiError(e.message || "Không kết nối được Ops API"));
  };

  useEffect(() => {
    loadServices();
    const t = setInterval(loadServices, 10000);
    return () => clearInterval(t);
  }, [location.pathname]);

  const logout = () => {
    clearCreds();
    navigate("/login", { replace: true });
  };

  const groups = [
    { key: "infra", label: "Hạ tầng" },
    { key: "app", label: "Ứng dụng" },
    { key: "ui", label: "Giao diện" },
    { key: "ops", label: "Ops" }
  ];

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <span className="mark">N</span>
          <div>
            <strong>Nava Ops</strong>
            <small>Quản lý deploy & log</small>
          </div>
        </div>

        <nav className="main-nav" aria-label="Menu chính">
          <NavLink to="/" end>
            Tổng quan
          </NavLink>
          <NavLink to="/services">Tất cả service</NavLink>
          <NavLink to="/deploy">Deploy</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/logs">Logs nhanh</NavLink>
        </nav>

        <div className="svc-nav">
          <div className="svc-nav-head">
            <span>Services</span>
            <button type="button" className="linkish" onClick={loadServices}>
              Làm mới
            </button>
          </div>
          {apiError && <p className="rail-error">{apiError}</p>}
          {groups.map((g) => {
            const items = services.filter((s) => s.group === g.key);
            if (!items.length) return null;
            return (
              <div key={g.key} className="svc-group">
                <p className="svc-group-label">{g.label}</p>
                {items.map((s) => (
                  <NavLink key={s.id} to={`/services/${s.id}`} className="svc-link" title={s.displayName}>
                    <span className={`dot ${s.status}`} />
                    <span className="svc-name">{s.displayName}</span>
                    <em>{s.port != null ? `:${s.port}` : ""}</em>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        <div className="rail-user">
          <span>
            Đã đăng nhập: <strong>{user}</strong>
          </span>
          <button type="button" className="btn ghost rail-logout" onClick={logout}>
            Đăng xuất
          </button>
        </div>

        <div className="rail-links">
          <a href="http://localhost:5173" target="_blank" rel="noreferrer">
            Storefront
          </a>
          <a href="http://localhost:8088" target="_blank" rel="noreferrer">
            Spring Admin
          </a>
          <a href="http://localhost:8761" target="_blank" rel="noreferrer">
            Eureka
          </a>
        </div>
      </aside>

      <main className="main">
        {apiError && (
          <div className="banner error sticky-banner">
            API lỗi: {apiError}. Kiểm tra container ops-api hoặc đăng nhập lại.
          </div>
        )}
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/logs/:id" element={<LogsPage />} />
          <Route path="/deploy" element={<DeployPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
