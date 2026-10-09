import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLogs, fetchServices } from "../api.js";

export default function LogsPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [id, setId] = useState(routeId || "gateway");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(null);
  const preRef = useRef(null);

  useEffect(() => {
    fetchServices()
      .then((list) => {
        setServices(list);
        if (!routeId && list[0]) setId(list[0].id);
      })
      .catch((e) => setError(e.message));
  }, [routeId]);

  useEffect(() => {
    if (routeId && routeId !== id) setId(routeId);
  }, [routeId]);

  useEffect(() => {
    if (!id || paused) return;
    let dead = false;
    const tick = () => {
      fetchLogs(id, 250, filter)
        .then((t) => {
          if (!dead) setText(t || "(empty)");
        })
        .catch((e) => {
          if (!dead) setError(e.message);
        });
    };
    tick();
    const t = setInterval(tick, 2000);
    return () => {
      dead = true;
      clearInterval(t);
    };
  }, [id, filter, paused]);

  useEffect(() => {
    if (!paused && preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [text, paused]);

  const title = useMemo(() => services.find((s) => s.id === id)?.displayName || id, [services, id]);

  return (
    <section className="logs-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Live tail</p>
          <h1>{title}</h1>
        </div>
        <div className="row gap">
          <select
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              navigate(`/logs/${e.target.value}`);
            }}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName}
              </option>
            ))}
          </select>
          <input
            placeholder="Lọc text..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button type="button" className="btn ghost" onClick={() => setPaused((p) => !p)}>
            {paused ? "Tiếp tục" : "Tạm dừng"}
          </button>
        </div>
      </header>
      {error && <div className="banner error">{error}</div>}
      <pre className="log-view log-view-xl" ref={preRef}>
        {text || "Đang tải log..."}
      </pre>
      <p className="muted tiny">
        Gợi ý: chọn service ở sidebar trái để mở trang chi tiết (log lớn hơn + restart/rebuild).
        · refresh 2s {!paused ? "(đang chạy)" : "(paused)"}
      </p>
    </section>
  );
}
