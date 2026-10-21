import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeForAuthenticatedUser } from "../utils/authRedirect.js";
import { ErrorBanner } from "../components/Feedback";

export default function AdminLoginPage() {
  const { login, isAuthenticated, isPlatformAdmin, isSeller, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    const dest = homeForAuthenticatedUser({
      isPlatformAdmin,
      isSeller,
      mustChangePassword: user?.mustChangePassword
    });
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = String(user.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "PLATFORM_ADMIN") {
        setError({
          message: "Tài khoản này không có quyền quản trị sàn. Dùng cổng khách hoặc người bán."
        });
        return;
      }
      const dest = location.state?.from?.startsWith("/admin") ? location.state.from : "/admin";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout auth-platform">
      <div className="auth-copy">
        <p className="eyebrow">Quản trị sàn</p>
        <h1>Đăng nhập dành cho Platform Admin</h1>
        <p className="muted">Không dùng cổng này cho khách mua hàng hoặc người bán.</p>
        <div className="auth-platform-preview" aria-hidden="true">
          <strong>Platform Console gồm:</strong>
          <ul>
            <li>Tổng quan GMV · đơn · shop chờ duyệt</li>
            <li>Duyệt / từ chối / tạm ngưng gian hàng</li>
            <li>Đơn toàn sàn & khách hàng</li>
          </ul>
        </div>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Admin</h2>
        <ErrorBanner error={error} />
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" autoComplete="email" />
        </label>
        <label>
          Mật khẩu
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            autoComplete="current-password"
          />
        </label>
        <button className="btn btn-lg" disabled={loading}>
          {loading ? "Đang đăng nhập…" : "Vào Quản trị sàn"}
        </button>
        <p className="auth-links">
          <Link to="/">← Về trang chủ</Link>
          {" · "}
          <Link to="/login">Cổng khách hàng</Link>
        </p>
      </form>
    </section>
  );
}
