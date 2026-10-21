import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isPlatformAdmin, isSeller } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if ((role === "ADMIN" || role === "PLATFORM_ADMIN") && !isPlatformAdmin) {
    return (
      <section className="form-card narrow">
        <p className="eyebrow">Quản trị</p>
        <h1>Bạn không có quyền truy cập</h1>
        <p className="muted">Trang này dành cho tài khoản quản trị sàn. Vui lòng đăng nhập bằng tài khoản phù hợp.</p>
        <Link className="btn" to="/login" state={{ from: "/admin" }}>
          Đăng nhập
        </Link>
      </section>
    );
  }
  if (role === "SELLER" && !isSeller && !isPlatformAdmin) {
    return <Navigate to="/register-shop" replace />;
  }
  if (role === "CUSTOMER" && isPlatformAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
