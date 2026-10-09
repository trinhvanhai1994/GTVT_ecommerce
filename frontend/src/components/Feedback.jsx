import { MessageConstant } from "../constants";

export function Loading({ text = "Đang tải..." }) {
  return (
    <div className="skeleton-wrap" role="status">
      <div className="skeleton" />
      <div className="skeleton short" />
      <p className="muted">{text}</p>
    </div>
  );
}

/** Chỉ hiển thị message người dùng — không hiện mã lỗi hệ thống. */
export function ErrorBanner({ error }) {
  if (!error) return null;
  const text = error.message || MessageConstant.UNKNOWN_ERROR;
  return (
    <div className="banner error" role="alert">
      <strong>{MessageConstant.ERROR_OCCURRED}</strong>
      <span>{text}</span>
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
