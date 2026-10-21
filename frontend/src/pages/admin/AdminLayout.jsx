import { useMemo, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import PlatformShell from "../../components/admin/PlatformShell.jsx";
import { useAuth } from "../../context/AuthContext";
import { AdminContext, legacyAdminPath } from "./adminContext.js";

export default function AdminLayout() {
  const { user, isPlatformAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const viewParam = searchParams.get("view");
  const shopIdParam = searchParams.get("shopId");
  let legacyRedirect = viewParam ? legacyAdminPath(viewParam, shopIdParam) : null;
  if (location.pathname === "/admin/orders" || legacyRedirect === "/admin/orders") {
    legacyRedirect = "/admin";
  }

  const ctx = useMemo(() => ({}), []);

  if (legacyRedirect) return <Navigate to={legacyRedirect} replace />;
  if (location.pathname === "/admin/orders") return <Navigate to="/admin" replace />;
  if (!isPlatformAdmin) return <Navigate to="/" replace />;

  return (
    <AdminContext.Provider value={ctx}>
      <PlatformShell
        user={user}
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={(v) => setMobileNavOpen(typeof v === "boolean" ? v : !mobileNavOpen)}
      />
    </AdminContext.Provider>
  );
}
