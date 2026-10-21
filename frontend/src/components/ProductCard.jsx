import { Link } from "react-router-dom";
import { money, productImage } from "../utils/catalog";

export default function ProductCard({ product, shopId }) {
  const href = shopId != null ? `/shops/${shopId}/products/${product.id}` : `/products/${product.id}`;
  return (
    <article className="product-card">
      <Link to={href} className="product-media">
        <img src={productImage(product)} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <p className="product-brand">{product.brand}</p>
        <h3>
          <Link to={href}>{product.name}</Link>
        </h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-foot">
          <span className="price">{money(product.price)}</span>
          <Link className="btn btn-ghost" to={href}>
            Xem
          </Link>
        </div>
      </div>
    </article>
  );
}
