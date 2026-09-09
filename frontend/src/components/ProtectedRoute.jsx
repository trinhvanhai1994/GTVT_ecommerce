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
      <div className="page" style={{ maxWidth: 560, margin: "60px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: 40 }}>
          <i className="fa-solid fa-lock fa-3x" style={{ color: "var(--danger)", marginBottom: 16 }}></i>
          <h1 className="h1" style={{ fontSize: 24 }}>Yêu cầu quyền Quản trị viên</h1>
          <p className="muted" style={{ margin: "12px 0 24px" }}>
            Khu vực này chỉ dành cho tài khoản có quyền <strong>ADMIN</strong>. Vui lòng đăng nhập tài khoản Quản trị.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link className="btn primary" to="/login" state={{ from: "/admin" }}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập Admin
            </Link>
            <Link className="btn" to="/">Về trang chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  if (role === "CUSTOMER" && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
