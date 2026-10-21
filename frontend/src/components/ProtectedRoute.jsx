import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function loginPathFor(role, explicit) {
  if (explicit) return explicit;
  if (role === "ADMIN" || role === "PLATFORM_ADMIN") return "/admin/login";
  if (role === "SELLER") return "/seller/login";
  return "/login";
}

export function ProtectedRoute({ children, role, loginPath }) {
  const { isAuthenticated, isPlatformAdmin, isSeller, user } = useAuth();
  const location = useLocation();
  const signIn = loginPathFor(role, loginPath);

  if (!isAuthenticated) {
    return <Navigate to={signIn} replace state={{ from: location.pathname }} />;
  }
  if ((role === "ADMIN" || role === "PLATFORM_ADMIN") && !isPlatformAdmin) {
    return (
      <section className="form-card narrow">
        <p className="eyebrow">Quản trị</p>
        <h1>Bạn không có quyền truy cập</h1>
        <p className="muted">Trang này dành cho tài khoản quản trị sàn.</p>
        <Link className="btn" to="/admin/login" state={{ from: "/admin" }}>
          Đăng nhập quản trị
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
  if (role === "CUSTOMER" && isSeller) {
    return <Navigate to="/seller" replace />;
  }
  if (location.pathname !== "/change-password" && user?.mustChangePassword && isSeller) {
    return <Navigate to="/change-password" replace />;
  }
  return children;
}
