/** Khung nội dung thống nhất cho mọi trang trong /admin */
export function PlatformPage({ children, toolbar }) {
  return (
    <div className="platform-page">
      {toolbar}
      {children}
    </div>
  );
}

export function PlatformToolbar({ children }) {
  return <div className="platform-toolbar">{children}</div>;
}
