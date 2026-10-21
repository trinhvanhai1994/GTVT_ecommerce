import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import MerchantShell from "../../components/seller/MerchantShell.jsx";
import SellerOnboarding from "../../components/seller/SellerOnboarding.jsx";
import { ErrorBanner, Loading } from "../../components/Feedback";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { OPEN_ORDER_STATUSES, SellerContext, VIEW_TO_PATH } from "./sellerContext.js";

export default function SellerLayout() {
  const { isSeller, isPlatformAdmin, user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openOrderCount, setOpenOrderCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const viewParam = searchParams.get("view");
  const legacyRedirect = viewParam && VIEW_TO_PATH[viewParam] ? VIEW_TO_PATH[viewParam] : null;

  useEffect(() => {
    api
      .get("/shops/me")
      .then((r) => setShop(r.data.data))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!shop?.id || shop.status !== "APPROVED") return;
    api
      .get("/orders/seller", { params: { shopId: shop.id } })
      .then((r) => {
        const list = r.data.data || [];
        setOpenOrderCount(list.filter((o) => OPEN_ORDER_STATUSES.has(o.status)).length);
      })
      .catch(() => {});
  }, [shop?.id, shop?.status, location.pathname]);

  const ctx = useMemo(
    () => ({
      shop,
      setShop,
      openOrderCount,
      setOpenOrderCount,
      refreshShop: () => api.get("/shops/me").then((r) => setShop(r.data.data))
    }),
    [shop, openOrderCount]
  );

  if (legacyRedirect) return <Navigate to={legacyRedirect} replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (isPlatformAdmin) return <Navigate to="/admin" replace />;
  if (!isSeller && !loading) return <Navigate to="/register-shop" replace />;
  if (loading) return <Loading />;
  if (!shop) {
    return (
      <section className="form-card seller-empty">
        <ErrorBanner error={error} />
        <p>Chưa có cửa hàng liên kết tài khoản seller. Nếu bạn vừa gửi hồ sơ, chờ duyệt; nếu đã duyệt mà vẫn thấy màn hình này, liên hệ quản trị sàn.</p>
      </section>
    );
  }

  if (shop.status !== "APPROVED") {
    return (
      <SellerContext.Provider value={ctx}>
        <SellerOnboarding shop={shop} />
      </SellerContext.Provider>
    );
  }

  return (
    <SellerContext.Provider value={ctx}>
      <MerchantShell
        shop={shop}
        openOrderCount={openOrderCount}
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={(v) => setMobileNavOpen(typeof v === "boolean" ? v : !mobileNavOpen)}
      />
    </SellerContext.Provider>
  );
}
