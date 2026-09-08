import { createContext, useContext, useMemo, useState } from "react";
import { getBike } from "../data/bikes.js";

const CartContext = createContext(null);
const KEY = "voltra-cart";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  const persist = (next) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = (id, qty = 1) => {
    const next = [...items];
    const i = next.findIndex((x) => x.id === id);
    if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + qty };
    else next.push({ id, qty });
    persist(next);
  };

  const setQty = (id, qty) => {
    persist(items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x)));
  };

  const remove = (id) => persist(items.filter((x) => x.id !== id));
  const clear = () => persist([]);

  const detailed = useMemo(
    () =>
      items
        .map((x) => ({ ...x, bike: getBike(x.id) }))
        .filter((x) => x.bike),
    [items]
  );

  const count = detailed.reduce((s, x) => s + x.qty, 0);
  const total = detailed.reduce((s, x) => s + x.qty * x.bike.price, 0);

  return (
    <CartContext.Provider value={{ items: detailed, add, setQty, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
