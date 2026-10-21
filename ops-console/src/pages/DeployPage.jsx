import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchServices, postServiceAction, postStackAction } from "../api.js";
import { useDialog } from "../context/DialogContext.jsx";

const SERVICE_ACTIONS = [
  { value: "RESTART", label: "Restart" },
  { value: "STOP", label: "Stop" },
  { value: "START", label: "Start" },
  { value: "REBUILD", label: "Rebuild image" },
  { value: "MAVEN_REBUILD", label: "Maven + rebuild" }
];

const STACK_ACTIONS = [
  { value: "STOP_ALL", label: "Stop all (giữ Ops)" },
  { value: "START_ALL", label: "Start / up all (giữ Ops)" },
  { value: "REBUILD_ALL", label: "Rebuild all images (giữ Ops)" },
  { value: "FULL", label: "Full deploy Maven + build (giữ Ops)" }
];

const OPS_IDS = new Set(["ops-api", "ops-ui"]);

export default function DeployPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { confirm, toast } = useDialog();
  const [services, setServices] = useState([]);
  const initialSvc = params.get("service");
  const [scope, setScope] = useState(initialSvc && !OPS_IDS.has(initialSvc) ? "one" : "all");
  const [service, setService] = useState(initialSvc && !OPS_IDS.has(initialSvc) ? initialSvc : "auth");
  const [action, setAction] = useState(initialSvc && !OPS_IDS.has(initialSvc) ? "RESTART" : "START_ALL");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const managed = useMemo(() => (services || []).filter((s) => !OPS_IDS.has(s.id)), [services]);

  useEffect(() => {
    fetchServices()
      .then((list) => {
        const m = (list || []).filter((s) => !OPS_IDS.has(s.id));
        setServices(list || []);
        if (!params.get("service") && m[0]) setService(m[0].id);
        if (params.get("service") && OPS_IDS.has(params.get("service"))) {
          setScope("all");
          setAction("START_ALL");
        }
      })
      .catch((e) => setError(e.message));
  }, [params]);

  const confirmText = () => {
    if (scope === "all") {
      if (action === "STOP_ALL") return "Stop mọi service ứng dụng. ops-api / ops-ui không đụng tới.";
      if (action === "FULL") return "Maven toàn reactor rồi rebuild các service ứng dụng. Ops không rebuild.";
      if (action === "REBUILD_ALL") return "Rebuild image các service ứng dụng (skip Maven). Ops không đụng tới.";
      return "docker compose up -d các service ứng dụng. Ops giữ nguyên.";
    }
    if (action === "STOP") return `Stop ${service}. Có thể Start lại sau.`;
    if (action === "START") return `Start ${service}.`;
    if (action === "RESTART") return `Restart ${service} (không build).`;
    if (action === "REBUILD") return `Rebuild image ${service} (--no-deps).`;
    return `Maven + rebuild ${service}.`;
  };

  const submit = async (e) => {
    e.preventDefault();
    const danger = action === "STOP" || action === "STOP_ALL";
    const ok = await confirm({
      title: scope === "all" ? `Chạy ${action}?` : `${action} · ${service}?`,
      message: confirmText(),
      confirmLabel: danger ? "Tiếp tục" : "Chạy",
      cancelLabel: "Huỷ",
      danger
    });
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      const job =
        scope === "all"
          ? await postStackAction(action)
          : await postServiceAction(service, action);
      toast({ title: "Đã gửi job", message: `${job.title || action} · #${job.id}`, variant: "ok" });
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setError(err.message);
      toast({ title: "Lỗi", message: err.message, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Quản lý stack</p>
          <h1>Deploy</h1>
          <p className="muted">Chỉ thao tác service ứng dụng. Ops Console luôn được giữ.</p>
        </div>
      </header>
      {error && <div className="banner error">{error}</div>}

      <form className="deploy-form" onSubmit={submit}>
        <fieldset>
          <legend>Phạm vi</legend>
          <label className="radio">
            <input
              type="radio"
              checked={scope === "all"}
              onChange={() => {
                setScope("all");
                setAction("START_ALL");
              }}
            />
            Nhiều service (giữ Ops)
          </label>
          <label className="radio">
            <input
              type="radio"
              checked={scope === "one"}
              onChange={() => {
                setScope("one");
                setAction("RESTART");
              }}
            />
            Một service
          </label>
        </fieldset>

        {scope === "one" && (
          <label>
            Service
            <select value={service} onChange={(e) => setService(e.target.value)}>
              {managed.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Thao tác
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            {(scope === "all" ? STACK_ACTIONS : SERVICE_ACTIONS).map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <p className="hint">{confirmText()}</p>
        <p className="muted tiny">ops-api / ops-ui không nằm trong mọi lệnh từ Ops Console.</p>

        <button className={`btn primary${dangerClass(action)}`} disabled={busy || (scope === "one" && !managed.length)}>
          {busy ? "Đang gửi..." : "Xác nhận chạy"}
        </button>
      </form>
    </section>
  );
}

function dangerClass(action) {
  return action === "STOP" || action === "STOP_ALL" ? " danger" : "";
}
