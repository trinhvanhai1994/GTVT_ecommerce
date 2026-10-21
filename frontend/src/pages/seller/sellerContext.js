import { createContext, useContext } from "react";

export const SellerContext = createContext(null);

export function useSellerShop() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSellerShop requires SellerLayout");
  return ctx;
}

export const OPEN_ORDER_STATUSES = new Set([
  "PENDING",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING"
]);

export const VIEW_TO_PATH = {
  home: "/seller",
  orders: "/seller/orders",
  catalog: "/seller/products",
  categories: "/seller/categories",
  stock: "/seller/inventory",
  profile: "/seller/settings"
};
