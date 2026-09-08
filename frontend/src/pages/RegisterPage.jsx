import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Feedback";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "Password123", fullName: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError({ message: "Mật khẩu tối thiểu 8 ký tự" });
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/login", { state: location.state || { from: "/products" } });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Thành viên mới</p>
        <h1>Tạo tài khoản trong một phút.</h1>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Đăng ký</h2>
        <ErrorBanner error={error} />
        <label>
          Họ tên
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Mật khẩu
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="btn btn-lg" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
        <p className="muted">
          Đã có tài khoản? <Link to="/login" state={location.state}>Đăng nhập</Link>
        </p>
      </form>
    </section>
  );
}
