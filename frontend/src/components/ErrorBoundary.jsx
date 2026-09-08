import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { message: null };
  }

  static getDerivedStateFromError(error) {
    return { message: error?.message || "Unknown error" };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.message) {
      this.setState({ message: null });
    }
  }

  render() {
    if (this.state.message) {
      return (
        <div className="page">
          <div className="container" style={{ maxWidth: "560px", marginTop: "40px" }}>
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "var(--danger-soft)",
                  color: "var(--danger)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px"
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h1 className="h1" style={{ fontSize: "24px" }}>
                Đã xảy ra lỗi giao diện
              </h1>
              <p className="muted" style={{ margin: "12px 0 24px" }}>
                {this.state.message}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  className="btn primary"
                  type="button"
                  onClick={() => this.setState({ message: null })}
                >
                  <i className="fa-solid fa-rotate"></i> Thử tải lại
                </button>
                <Link className="btn" to="/">
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
