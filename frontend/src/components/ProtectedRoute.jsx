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
      <div className="page">
        <div className="container" style={{ maxWidth: "600px", marginTop: "40px" }}>
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--danger-soft)",
                color: "var(--danger)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginBottom: "20px"
              }}
            >
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="chip sale" style={{ marginBottom: "14px" }}>
              QUYỀN HẠN NỘI BỘ
            </div>
            <h1 className="h1" style={{ fontSize: "26px" }}>
              Yêu cầu quyền Quản trị viên
            </h1>
            <p className="muted" style={{ margin: "14px 0 28px", lineHeight: "1.6" }}>
              Khu vực điều hành này chỉ dành cho tài khoản có quyền <strong>ADMIN</strong>. Vui lòng đăng nhập với tài
              khoản <strong>admin@example.com</strong> (Mật khẩu: <code>Password123</code>).
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link className="btn primary" to="/login" state={{ from: "/admin" }}>
                <i className="fa-solid fa-arrow-right-to-bracket"></i> Đăng nhập Admin
              </Link>
              <Link className="btn" to="/">
                Về trang chủ
              </Link>
            </div>
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
