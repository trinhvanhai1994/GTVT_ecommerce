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

  const groups = [
    { key: "infra", label: "Hạ tầng" },
    { key: "app", label: "Ứng dụng" },
    { key: "ui", label: "Giao diện" },
    { key: "ops", label: "Ops (chỉ xem log)" }
  ];

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Danh sách</p>
          <h1>Services</h1>
          <p className="muted">Click để xem log. Deploy/stop/restart chỉ cho service ngoài Ops.</p>
        </div>
        <button type="button" className="btn ghost" onClick={load}>
          Làm mới
        </button>
      </header>
      {error && <div className="banner error">{error}</div>}

      {groups.map((g) => {
        const items = list.filter((s) => s.group === g.key);
        if (!items.length) return null;
        const isOps = g.key === "ops";
        return (
          <div key={g.key} className="group">
            <h2>{g.label}</h2>
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
                  <span className="open-hint">{isOps ? "Chỉ xem log →" : "Log & thao tác →"}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
