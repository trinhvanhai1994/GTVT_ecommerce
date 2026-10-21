import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchOverview, postStackAction } from "../api.js";
import StatusPill from "../components/StatusPill.jsx";
import { useDialog } from "../context/DialogContext.jsx";

const OPS_IDS = new Set(["ops-api", "ops-ui"]);

export default function OverviewPage() {
  const navigate = useNavigate();
  const { confirm, toast } = useDialog();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

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

  const runStack = async (action, title, message, danger) => {
    const ok = await confirm({
      title,
      message,
      confirmLabel: danger ? "Tiếp tục" : "Chạy",
      cancelLabel: "Huỷ",
      danger
    });
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      const job = await postStackAction(action);
      toast({ title: "Đã gửi job", message: `${action} · #${job.id}`, variant: "ok" });
      navigate(`/jobs/${job.id}`);
    } catch (e) {
      setError(e.message);
      toast({ title: "Lỗi", message: e.message, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) {
    return (
      <section>
        <h1>Tổng quan</h1>
        <div className="banner error">{error}</div>
      </section>
    );
  }
  if (!data) return <p className="muted">Đang tải...</p>;

  const managed = (data.services || []).filter((s) => !OPS_IDS.has(s.id));
  const ops = (data.services || []).filter((s) => OPS_IDS.has(s.id));

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Local lab</p>
          <h1>Tổng quan</h1>
          <p className="muted">Thao tác chỉ áp dụng service ứng dụng — Ops luôn giữ.</p>
        </div>
        <div className="row gap wrap">
          <button
            type="button"
            className="btn danger"
            disabled={busy}
            onClick={() =>
              runStack("STOP_ALL", "Stop all?", "Dừng mọi service ứng dụng. ops-api / ops-ui không đụng tới.", true)
            }
          >
            Stop all
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() =>
              runStack("START_ALL", "Start all?", "Up các service ứng dụng. Ops giữ nguyên.", false)
            }
          >
            Start all
          </button>
          <Link className="btn ghost" to="/deploy">
            Deploy…
          </Link>
          <button type="button" className="btn ghost" onClick={load}>
            Làm mới
          </button>
        </div>
      </header>
      {error && <div className="banner error">{error}</div>}

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
          <strong>{managed.length}</strong>
          <span>Service quản lý</span>
        </div>
      </div>

      <div className="split overview-split">
        <div>
          <h2>Services ứng dụng</h2>
          <ul className="plain">
            {managed.map((s) => (
              <li key={s.id}>
                <Link to={`/services/${s.id}`}>
                  <span>{s.displayName}</span>
                  <StatusPill status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
          {ops.length > 0 && (
            <>
              <h2>Ops (chỉ xem)</h2>
              <ul className="plain">
                {ops.map((s) => (
                  <li key={s.id}>
                    <Link to={`/services/${s.id}`}>
                      <span>{s.displayName}</span>
                      <StatusPill status={s.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
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
