import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role === "ADMIN" && !isAdmin) {
    return (
      <section className="form-card narrow">
        <p className="eyebrow">Nội bộ</p>
        <h1>Cần tài khoản quản trị</h1>
        <p className="muted">
          Đăng nhập <strong>admin@example.com</strong> / Password123 để quản lý sản phẩm, tồn kho, đơn và người dùng.
        </p>
        <Link className="btn" to="/login" state={{ from: "/admin" }}>
          Đăng nhập admin
        </Link>
      </section>
    );
  }
  if (role === "CUSTOMER" && isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
