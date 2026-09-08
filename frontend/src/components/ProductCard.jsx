import { Link } from "react-router-dom";
import { getNormalizedPrice, money, productImage } from "../utils/catalog";

export default function ProductCard({ product }) {
  const meta = product.brand
    ? `${product.brand} · ${product.category || "Công nghệ"}`
    : product.description || "Chính hãng · Bảo hành 24T";

  const normPrice = getNormalizedPrice(product.price);
  const normOriginal = product.originalPrice ? getNormalizedPrice(product.originalPrice) : null;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-media">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80";
          }}
        />
      </Link>
      <div className="badges">
        <span className="chip">CHÍNH HÃNG</span>
        {product.sale && <span className="chip sale">{product.sale}</span>}
        {normOriginal && normOriginal > normPrice && !product.sale && (
          <span className="chip sale">GIẢM SỐC</span>
        )}
      </div>
      <h3>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <div className="small muted" style={{ marginBottom: "6px" }}>
        {meta}
      </div>
      <div className="price">{money(product.price)}</div>
      <div className="benefit">
        <i className="fa-solid fa-bolt" style={{ marginRight: "4px" }}></i>
        Trả góp 0% · Giao nhanh 2H · So sánh
      </div>
    </article>
  );
}
