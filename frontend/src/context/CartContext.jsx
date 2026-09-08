import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [cart, setCart] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || isAdmin) {
      setCart(null);
      return;
    }
    try {
      const { data } = await api.get("/cart");
      setCart(data.data);
    } catch {
      setCart(null);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const count = useMemo(
    () => (cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart]
  );

  return <CartContext.Provider value={{ cart, setCart, refresh, count }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
