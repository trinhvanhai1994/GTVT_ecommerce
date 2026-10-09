import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchLogs, fetchServices, postServiceAction } from "../api.js";
import StatusPill from "../components/StatusPill.jsx";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [svc, setSvc] = useState(null);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");
  const [tail, setTail] = useState(500);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const preRef = useRef(null);

  useEffect(() => {
    fetchServices()
      .then((list) => {
        const found = (list || []).find((s) => s.id === id);
        setSvc(found || null);
        if (!found) setError("Không tìm thấy service: " + id);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!id || paused) return;
    let dead = false;
    const tick = () => {
      fetchLogs(id, tail, filter)
        .then((t) => {
          if (!dead) {
            setText(t || "(empty)");
            setError(null);
          }
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
  }, [id, filter, paused, tail]);

  useEffect(() => {
    if (!paused && preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [text, paused]);

  const runAction = async (action) => {
    const labels = {
      RESTART: "Restart (không build)",
      REBUILD: "Rebuild image (không Maven)",
      MAVEN_REBUILD: "Maven + rebuild"
    };
    if (!window.confirm(`${labels[action] || action} — ${id}?`)) return;
    setBusy(true);
    try {
      const job = await postServiceAction(id, action);
      navigate(`/jobs/${job.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!svc && !error) return <p className="muted">Đang tải service...</p>;

  return (
    <section className="detail-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">
            <Link to="/services">Services</Link> / {id}
          </p>
          <h1>{svc?.displayName || id}</h1>
          <p className="muted tiny meta-line">
            {svc?.composeService}
            {svc?.port != null ? ` · port ${svc.port}` : ""}
            {svc?.containerName ? ` · ${svc.containerName}` : ""}
            {svc?.mavenModule ? ` · ${svc.mavenModule}` : ""}
          </p>
        </div>
        <div className="row gap wrap">
          {svc && <StatusPill status={svc.status} />}
          <button type="button" className="btn" disabled={busy || id === "ops-api"} onClick={() => runAction("RESTART")}>
            Restart
          </button>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => runAction("REBUILD")}>
            Rebuild
          </button>
          <button type="button" className="btn ghost" disabled={busy || !svc?.mavenModule} onClick={() => runAction("MAVEN_REBUILD")}>
            Maven rebuild
          </button>
          <Link className="btn ghost" to={`/deploy?service=${id}`}>
            Deploy…
          </Link>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}

      <div className="log-toolbar">
        <strong>Logs trực tiếp</strong>
        <input placeholder="Lọc text / cid..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <select value={tail} onChange={(e) => setTail(Number(e.target.value))}>
          <option value={200}>200 dòng</option>
          <option value={500}>500 dòng</option>
          <option value={1000}>1000 dòng</option>
          <option value={2000}>2000 dòng</option>
        </select>
        <button type="button" className="btn ghost" onClick={() => setPaused((p) => !p)}>
          {paused ? "Tiếp tục" : "Tạm dừng"}
        </button>
      </div>

      <pre className="log-view log-view-xl" ref={preRef}>
        {text || "Đang tải log..."}
      </pre>
      <p className="muted tiny">
        Tự làm mới 2s · {paused ? "đã tạm dừng" : "đang chạy"} · tối đa {tail} dòng
      </p>
    </section>
  );
}
