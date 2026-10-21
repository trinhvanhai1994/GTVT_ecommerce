import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = (query = "") => {
    setLoading(true);
    api
      .get("/shops", { params: { status: "APPROVED", q: query || undefined } })
      .then((r) => setShops(r.data.data || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Sàn Nava</p>
          <h1>Khám phá gian hàng, mua sắm dễ dàng.</h1>
          <p className="lede">
            Hàng nghìn sản phẩm từ nhiều cửa hàng trên một sàn. Chọn gian hàng yêu thích và đặt mua chỉ với vài bước.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#shops">
              Xem cửa hàng
            </a>
            <Link className="btn btn-ghost" to="/register-shop">
              Đăng ký bán hàng
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
            alt=""
          />
        </div>
      </section>

      <section id="shops">
        <div className="section-head">
          <h2>Cửa hàng trên sàn</h2>
          <form
            className="shop-search"
            onSubmit={(e) => {
              e.preventDefault();
              load(q.trim());
            }}
          >
            <input
              placeholder="Tìm cửa hàng theo tên…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn btn-ghost" type="submit">
              Tìm
            </button>
          </form>
        </div>
        <ErrorBanner error={error} />
        {loading && <Loading />}
        {!loading && shops.length === 0 && (
          <Empty title="Chưa có gian hàng" text="Hiện chưa có cửa hàng nào đang mở bán. Vui lòng quay lại sau." />
        )}
        <div className="shop-grid">
          {shops.map((s) => (
            <Link key={s.id} to={`/shops/${s.id}`} className="shop-card">
              <div className="shop-card-media">
                <img
                  src={s.logoUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80"}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="shop-card-body">
                <h3>{s.name}</h3>
                <p className="muted">{s.description || "Gian hàng trên Nava"}</p>
                <span className="btn btn-ghost">Vào cửa hàng</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
