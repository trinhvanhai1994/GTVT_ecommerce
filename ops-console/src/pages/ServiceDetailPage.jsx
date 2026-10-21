import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchLogs, fetchServices, postServiceAction } from "../api.js";
import StatusPill from "../components/StatusPill.jsx";
import { useDialog } from "../context/DialogContext.jsx";

const OPS_IDS = new Set(["ops-api", "ops-ui"]);

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm, toast } = useDialog();
  const [svc, setSvc] = useState(null);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");
  const [tail, setTail] = useState(500);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const preRef = useRef(null);
  const isOps = OPS_IDS.has(id);

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
    if (isOps) return;
    const meta = {
      STOP: { title: "Stop container?", danger: true, confirmLabel: "Stop" },
      START: { title: "Start container?", danger: false, confirmLabel: "Start" },
      RESTART: { title: "Restart service?", danger: false, confirmLabel: "Restart" },
      REBUILD: { title: "Rebuild image?", danger: false, confirmLabel: "Rebuild" },
      MAVEN_REBUILD: { title: "Maven + rebuild?", danger: false, confirmLabel: "Chạy" }
    };
    const m = meta[action] || { title: action, confirmLabel: "Xác nhận", danger: false };
    const ok = await confirm({
      title: m.title,
      message: `${action} trên “${svc?.displayName || id}”. Ops không bị ảnh hưởng.`,
      confirmLabel: m.confirmLabel,
      cancelLabel: "Huỷ",
      danger: m.danger
    });
    if (!ok) return;
    setBusy(true);
    try {
      const job = await postServiceAction(id, action);
      toast({ title: "Đã gửi job", message: `${action} ${id} · #${job.id}`, variant: "ok" });
      navigate(`/jobs/${job.id}`);
    } catch (e) {
      setError(e.message);
      toast({ title: "Lỗi", message: e.message, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  if (!svc && !error) return <p className="muted">Đang tải service...</p>;

  const down = svc && (svc.status === "DOWN" || svc.status === "STOPPED");

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
          </p>
        </div>
        <div className="row gap wrap">
          {svc && <StatusPill status={svc.status} />}
          {!isOps && (
            <>
              <button type="button" className="btn danger" disabled={busy || down} onClick={() => runAction("STOP")}>
                Stop
              </button>
              <button type="button" className="btn" disabled={busy} onClick={() => runAction("START")}>
                Start
              </button>
              <button type="button" className="btn ghost" disabled={busy} onClick={() => runAction("RESTART")}>
                Restart
              </button>
              <button type="button" className="btn ghost" disabled={busy} onClick={() => runAction("REBUILD")}>
                Rebuild
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={busy || !svc?.mavenModule}
                onClick={() => runAction("MAVEN_REBUILD")}
              >
                Maven rebuild
              </button>
            </>
          )}
        </div>
      </header>

      {isOps && (
        <div className="banner warn">
          Service Ops chỉ xem status & log. Không restart/stop/deploy từ đây — để console không sập khi đang quản lý stack.
        </div>
      )}
      {error && <div className="banner error">{error}</div>}

      <div className="log-toolbar">
        <strong>Logs</strong>
        <input placeholder="Lọc text..." value={filter} onChange={(e) => setFilter(e.target.value)} />
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
    </section>
  );
}
