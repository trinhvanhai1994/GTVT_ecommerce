import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard.jsx";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    void api.get("/products", { params: { size: 8, status: "ACTIVE" } }).then((r) => setFeatured(r.data.data?.content || []));
    void api.get("/products/categories").then((r) => setCats(r.data.data || []));
  }, []);

  return (
    <>
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Bộ sưu tập 2026</p>
          <h1>Công nghệ gọn, chọn đúng một lần.</h1>
          <p className="lede">
            Điện thoại, laptop và phụ kiện đã kiểm tra tồn kho trước khi bạn thanh toán. Đổi trả 7 ngày, giao hàng
            toàn quốc.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/products">
              Mua sắm ngay
            </Link>
            <Link className="btn btn-ghost" to="/products?keyword=laptop">
              Xem laptop
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80"
            alt=""
          />
        </div>
      </section>

      <section className="trust-row">
        <div>
          <strong>Tồn kho thật</strong>
          <span>Giữ hàng khi đặt, không bán vượt</span>
        </div>
        <div>
          <strong>Thanh toán linh hoạt</strong>
          <span>COD hoặc thẻ / CK demo</span>
        </div>
        <div>
          <strong>Hỗ trợ nhanh</strong>
          <span>Theo dõi đơn đến từng bước</span>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Danh mục</h2>
          <Link to="/products">Tất cả sản phẩm</Link>
        </div>
        <div className="cat-row">
          {cats.map((c) => (
            <Link key={c.id} className="cat-chip" to={`/products?categoryId=${c.id}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Đang được quan tâm</h2>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
