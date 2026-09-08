import { Component } from "react";

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
        <section className="form-card">
          <h1>Không hiển thị được màn hình</h1>
          <p className="muted">{this.state.message}</p>
          <button className="btn" type="button" onClick={() => this.setState({ message: null })}>
            Thử lại
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
