import { Link } from "react-router-dom";
import { money, productImage } from "../utils/catalog";

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-media">
        <img src={productImage(product)} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <p className="product-brand">{product.brand}</p>
        <h3>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-foot">
          <span className="price">{money(product.price)}</span>
          <Link className="btn btn-ghost" to={`/products/${product.id}`}>
            Xem
          </Link>
        </div>
      </div>
    </article>
  );
}
