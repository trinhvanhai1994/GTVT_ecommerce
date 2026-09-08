import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Feedback";
import api from "../services/api";
import { clearPendingCart, readPendingCart } from "../utils/pendingCart";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = location.state?.from === "/admin";
  const [email, setEmail] = useState(fromAdmin ? "admin@example.com" : "customer@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = String(user.role || "").toUpperCase();
      if (role === "ADMIN") {
        clearPendingCart();
        navigate(location.state?.from?.startsWith("/admin") ? location.state.from : "/admin", { replace: true });
        return;
      }
      const pending = readPendingCart();
      if (pending?.productId) {
        try {
          await api.post("/cart/items", pending);
          clearPendingCart();
          navigate("/cart", { replace: true });
          return;
        } catch {
          clearPendingCart();
        }
      }
      const dest = location.state?.from || "/products";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Xin chào</p>
        <h1>{location.state?.intent === "cart" ? "Đăng nhập để thêm vào giỏ." : "Đăng nhập để mua và theo dõi đơn."}</h1>
        {location.state?.productName && (
          <p className="lede">Sản phẩm: {location.state.productName}</p>
        )}
        <p className="muted">Tài khoản demo: customer@example.com hoặc admin@example.com — mật khẩu Password123.</p>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Đăng nhập</h2>
        <ErrorBanner error={error} />
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" autoComplete="email" />
        </label>
        <label>
          Mật khẩu
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" autoComplete="current-password" />
        </label>
        <button className="btn btn-lg" disabled={loading}>
          {loading ? "Đang vào..." : "Vào cửa hàng"}
        </button>
        <p className="muted">
          Chưa có tài khoản? <Link to="/register" state={location.state}>Tạo mới miễn phí</Link>
        </p>
      </form>
    </section>
  );
}
