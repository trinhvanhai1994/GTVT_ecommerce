export default function DashboardShell({ theme, views, view, onNavigate, eyebrow, title, children, badgeCounts = {} }) {
  return (
    <section className={`dash-shell dash-theme-${theme}`}>
      <nav className="dash-nav" aria-label={theme === "platform" ? "Quản trị sàn" : "Kênh người bán"}>
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            className={view === item.id ? "on" : ""}
            onClick={() => onNavigate(item.id)}
          >
            {badgeCounts[item.id] > 0 && <span className="nav-count">{badgeCounts[item.id]}</span>}
            {item.label}
            {item.hint && <small>{item.hint}</small>}
          </button>
        ))}
      </nav>
      <div className="dash-main">
        <header className="dash-head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
          </div>
        </header>
        {children}
      </div>
    </section>
  );
}
