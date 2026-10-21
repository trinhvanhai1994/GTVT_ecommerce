import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GUEST_PUBLIC = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
  "/seller/login"
]);

function isGuestPublicPath(pathname) {
  if (GUEST_PUBLIC.has(pathname)) return true;
  if (pathname.startsWith("/shops/")) return true;
  if (pathname.startsWith("/products/")) return true;
  return false;
}

function isSellerAllowed(pathname) {
  if (pathname === "/change-password") return true;
  if (pathname === "/seller") return true;
  if (pathname.startsWith("/seller/")) return true;
  return false;
}

/** Enforces role sandbox after login: admin → /admin only; seller → /seller/* + change-password; customer → storefront. */
export default function RoleBoundary({ children }) {
  const { isAuthenticated, isPlatformAdmin, isSeller, user } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) {
    return children;
  }

  if (isPlatformAdmin) {
    if (!pathname.startsWith("/admin")) {
      return <Navigate to="/admin" replace />;
    }
    return children;
  }

  if (isSeller) {
    if (user?.mustChangePassword && pathname !== "/change-password") {
      return <Navigate to="/change-password" replace />;
    }
    if (!isSellerAllowed(pathname)) {
      return <Navigate to="/seller" replace />;
    }
    return children;
  }

  // CUSTOMER
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller") || pathname === "/change-password") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export { isGuestPublicPath, isSellerAllowed };
