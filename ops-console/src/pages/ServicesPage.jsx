import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchServices } from "../api.js";
import StatusPill from "../components/StatusPill.jsx";

export default function ServicesPage() {
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);

  const load = () =>
    fetchServices()
      .then(setList)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const groups = ["infra", "app", "ui", "ops"];

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Danh sách</p>
          <h1>Services</h1>
          <p className="muted">Click một service để xem chi tiết và log lớn bên phải.</p>
        </div>
        <button type="button" className="btn ghost" onClick={load}>
          Làm mới
        </button>
      </header>
      {error && <div className="banner error">{error}</div>}

      {groups.map((g) => {
        const items = list.filter((s) => s.group === g);
        if (!items.length) return null;
        return (
          <div key={g} className="group">
            <h2>{g}</h2>
            <div className="cards">
              {items.map((s) => (
                <Link key={s.id} to={`/services/${s.id}`} className="svc-card clickable">
                  <div className="svc-top">
                    <h3>{s.displayName}</h3>
                    <StatusPill status={s.status} />
                  </div>
                  <p className="muted tiny">
                    {s.composeService}
                    {s.port != null ? ` · :${s.port}` : ""}
                  </p>
                  <span className="open-hint">Xem log & thao tác →</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
