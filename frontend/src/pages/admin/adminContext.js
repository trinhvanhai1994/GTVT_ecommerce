import { createContext, useContext } from "react";

export const AdminContext = createContext(null);

export function useAdminPlatform() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminPlatform requires AdminLayout");
  return ctx;
}

export const VIEW_TO_PATH = {
  home: "/admin",
  shops: "/admin/shops",
  customers: "/admin/customers",
  orders: "/admin"
};

export function legacyAdminPath(view, shopId) {
  if (view === "shop-detail" && shopId) return `/admin/shops/${shopId}`;
  if (view === "orders") return "/admin";
  return VIEW_TO_PATH[view] || null;
}
