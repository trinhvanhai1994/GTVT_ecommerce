import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/Feedback";
import { MessageConstant, NumberConstant } from "../constants";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < NumberConstant.PASSWORD_MIN_LENGTH) {
      setError({ message: MessageConstant.PASSWORD_MIN_LENGTH });
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/login", {
        replace: true,
        state: { ...(location.state || { from: "/products" }), registeredOk: true, email: form.email }
      });
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
        <p className="lede">
          Sau khi đăng ký, Nava gửi email chào mừng tới hộp thư của bạn. Dùng cùng email này để nhận cập nhật đơn hàng.
        </p>
      </div>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Đăng ký</h2>
        <ErrorBanner error={error} />
        <label>
          Họ tên
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            autoComplete="name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={NumberConstant.PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            placeholder={`Tối thiểu ${NumberConstant.PASSWORD_MIN_LENGTH} ký tự`}
          />
        </label>
        <button className="btn btn-lg" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
        <p className="auth-links">
          Đã có tài khoản? <Link to="/login" state={location.state}>Đăng nhập</Link>
          {" · "}
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>
      </form>
    </section>
  );
}
