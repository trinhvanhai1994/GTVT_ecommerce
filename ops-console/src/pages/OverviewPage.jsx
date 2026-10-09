import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOverview } from "../api.js";
import StatusPill from "../components/StatusPill.jsx";

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    fetchOverview()
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (error) {
    return (
      <section>
        <h1>Tổng quan</h1>
        <div className="banner error">{error}</div>
      </section>
    );
  }
  if (!data) return <p className="muted">Đang tải...</p>;

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Local lab</p>
          <h1>Tổng quan hệ thống</h1>
        </div>
        <div className="row gap">
          <Link className="btn" to="/deploy">
            Deploy
          </Link>
          <button type="button" className="btn ghost" onClick={load}>
            Làm mới
          </button>
        </div>
      </header>

      <div className="stat-row">
        <div className="stat">
          <strong>{data.up}</strong>
          <span>Đang chạy</span>
        </div>
        <div className="stat">
          <strong>{data.starting}</strong>
          <span>Khởi động</span>
        </div>
        <div className="stat warn">
          <strong>{data.down}</strong>
          <span>Dừng / lỗi</span>
        </div>
        <div className="stat">
          <strong>{data.total}</strong>
          <span>Tổng service</span>
        </div>
      </div>

      <div className="split overview-split">
        <div>
          <h2>Services (click để xem log)</h2>
          <ul className="plain">
            {(data.services || []).map((s) => (
              <li key={s.id}>
                <Link to={`/services/${s.id}`}>
                  <span>{s.displayName}</span>
                  <StatusPill status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Jobs gần đây</h2>
          <ul className="plain">
            {(data.recentJobs || []).length === 0 && <li className="muted">Chưa có job</li>}
            {(data.recentJobs || []).map((j) => (
              <li key={j.id}>
                <Link to={`/jobs/${j.id}`}>
                  <span>
                    {j.title} <em className="muted">{j.status}</em>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
