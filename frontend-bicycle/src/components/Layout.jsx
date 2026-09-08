import { NavLink, Outlet } from "react-router-dom";
import { storeInfo } from "../data/bikes.js";
import { useCart } from "../context/CartContext.jsx";
import CursorGlow from "./CursorGlow.jsx";

export default function Layout() {
  const { count } = useCart();

  return (
    <>
      <CursorGlow />
      <header className="nav">
        <NavLink to="/" className="logo">
          BLUE<span>RA</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/shop">Cửa hàng</NavLink>
          <NavLink to="/tech">Chính sách</NavLink>
          <NavLink to="/cart">Giỏ hàng</NavLink>
        </nav>
        <div className="nav-cta">
          <a className="cart-pill" href={`tel:${storeInfo.hotline.replace(/\s/g, "")}`}>
            {storeInfo.hotline}
          </a>
          <NavLink to="/cart" className="cart-pill">
            Giỏ <em>{count}</em>
          </NavLink>
        </div>
      </header>
      <Outlet />
      <footer className="footer">
        <div>
          <strong>{storeInfo.company}</strong>
          <div>{storeInfo.address}</div>
          <div>
            {storeInfo.hotline} · {storeInfo.email}
          </div>
        </div>
        <div>Giá tham khảo từ dailyxedien.vn · MST {storeInfo.tax}</div>
      </footer>
    </>
  );
}
