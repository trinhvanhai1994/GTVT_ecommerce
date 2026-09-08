import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import TechPage from "./pages/TechPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";

function Wipe() {
  const loc = useLocation();
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(true);
    const t = setTimeout(() => setOn(false), 700);
    return () => clearTimeout(t);
  }, [loc.pathname]);

  return on ? <div className="wipe" /> : null;
}

export default function App() {
  return (
    <CartProvider>
      <Wipe />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/bikes/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/tech" element={<TechPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
