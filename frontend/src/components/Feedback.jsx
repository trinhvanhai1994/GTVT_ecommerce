export function Loading({ text = "Đang tải..." }) {
  return (
    <div className="skeleton-wrap" role="status">
      <div className="skeleton" />
      <div className="skeleton short" />
      <p className="muted">{text}</p>
    </div>
  );
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="banner error" role="alert">
      <strong>Có lỗi xảy ra.</strong>
      <span>
        {error.message}
        {error.code ? ` · ${error.code}` : ""}
      </span>
    </div>
  );
}

export function Empty({ title = "Chưa có gì ở đây", text, action }) {
  return (
    <div className="empty-state">
      <p className="empty-icon">◇</p>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}
