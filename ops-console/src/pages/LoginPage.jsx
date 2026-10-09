import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCreds, login } from "../api.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    clearCreds();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.status === 401 ? "Sai tài khoản hoặc mật khẩu." : err.message || "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-brand">
          <span className="mark">N</span>
          <div>
            <strong>Nava Ops</strong>
            <small>Console quản trị deploy & log</small>
          </div>
        </div>
        <h1>Đăng nhập</h1>
        <p className="muted">Nhập tài khoản ops để tiếp tục.</p>
        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Tài khoản
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <div className="banner error">{error}</div>}
          <button type="submit" className="btn primary login-submit" disabled={busy}>
            {busy ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <p className="muted tiny login-hint">Mặc định lab: admin / abc123</p>
      </div>
    </div>
  );
}
