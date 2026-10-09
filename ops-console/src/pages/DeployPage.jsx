import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchServices, postServiceAction, postStackAction } from "../api.js";

const SERVICE_ACTIONS = [
  { value: "RESTART", label: "Restart (không build)" },
  { value: "REBUILD", label: "Rebuild image (không Maven)" },
  { value: "MAVEN_REBUILD", label: "Maven + rebuild service" }
];

const STACK_ACTIONS = [
  { value: "RESTART_ONLY", label: "Restart all containers" },
  { value: "SKIP_MAVEN", label: "Rebuild all images (skip Maven)" },
  { value: "FULL", label: "Full deploy (Maven + build all)" }
];

export default function DeployPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [scope, setScope] = useState(params.get("service") ? "one" : "all");
  const [service, setService] = useState(params.get("service") || "auth");
  const [action, setAction] = useState(params.get("service") ? "RESTART" : "RESTART_ONLY");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchServices()
      .then((list) => {
        setServices(list);
        if (!params.get("service") && list[0]) setService(list[0].id);
      })
      .catch((e) => setError(e.message));
  }, [params]);

  const confirmText = () => {
    if (scope === "all") {
      if (action === "FULL") return "Chạy Maven toàn reactor rồi build lại mọi image. Mất vài phút.";
      if (action === "SKIP_MAVEN") return "Build lại mọi image từ JAR hiện có. Không chạy Maven.";
      return "Chỉ restart containers — không build.";
    }
    if (action === "RESTART") return `Restart ${service} — không Maven, không --build.`;
    if (action === "REBUILD") return `Build lại image ${service} (--no-deps). Không Maven.`;
    return `Maven -pl module -am rồi rebuild ${service}. Nếu Maven lỗi, container cũ giữ nguyên.`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!window.confirm(confirmText())) return;
    setBusy(true);
    setError(null);
    try {
      const job =
        scope === "all"
          ? await postStackAction(action)
          : await postServiceAction(service, action);
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">An toàn</p>
          <h1>Deploy</h1>
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
                setAction("RESTART_ONLY");
              }}
            />
            Toàn bộ stack
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
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Chế độ
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            {(scope === "all" ? STACK_ACTIONS : SERVICE_ACTIONS).map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <p className="hint">{confirmText()}</p>
        <p className="muted tiny">Không có nút xóa volume DB. Hai job song song: job sau chờ hoặc báo khóa.</p>

        <button className="btn primary" disabled={busy}>
          {busy ? "Đang gửi..." : "Xác nhận chạy"}
        </button>
      </form>
    </section>
  );
}
