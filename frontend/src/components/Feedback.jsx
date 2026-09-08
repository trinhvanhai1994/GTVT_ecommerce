export function Loading({ text = "Đang tải dữ liệu..." }) {
  return (
    <div className="skeleton-wrap" role="status" aria-label="Đang tải dữ liệu">
      <div className="skeleton" style={{ height: "24px", width: "40%", marginBottom: "16px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "16px" }}>
        <div className="skeleton" style={{ height: "220px", borderRadius: "14px" }} />
        <div className="skeleton" style={{ height: "220px", borderRadius: "14px" }} />
        <div className="skeleton" style={{ height: "220px", borderRadius: "14px" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted)", fontSize: "14px" }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ color: "var(--blue)" }}></i>
        <span>{text}</span>
      </div>
    </div>
  );
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="banner error" role="alert">
      <i className="fa-solid fa-circle-exclamation fa-lg"></i>
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block" }}>Thông báo sự cố</strong>
        <span style={{ fontSize: "13px" }}>
          {error.message || "Không thể kết nối đến máy chủ vi dịch vụ."}
          {error.code ? ` (${error.code})` : ""}
        </span>
      </div>
    </div>
  );
}

export function Empty({ title = "Chưa có dữ liệu", text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <i className="fa-solid fa-box-open"></i>
      </div>
      <h3 className="h3" style={{ fontSize: "20px" }}>{title}</h3>
      {text && <p className="muted" style={{ maxWidth: "420px", margin: "8px 0 20px" }}>{text}</p>}
      {action}
    </div>
  );
}
