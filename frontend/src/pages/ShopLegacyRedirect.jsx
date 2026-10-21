import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Empty, ErrorBanner, Loading } from "../components/Feedback";

/** Redirect legacy /shops/:key/products → /shops/:id (stable id). */
export default function ShopLegacyRedirect() {
  const { shopId: shopKey } = useParams();
  const [params] = useSearchParams();
  const [target, setTarget] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (/^\d+$/.test(String(shopKey || ""))) {
      setTarget(String(shopKey));
      return;
    }
    api
      .get(`/shops/${shopKey}`)
      .then((res) => {
        if (!cancelled) setTarget(String(res.data.data.id));
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });
    return () => {
      cancelled = true;
    };
  }, [shopKey]);

  if (error) {
    return (
      <section>
        <ErrorBanner error={error} />
        <Empty title="Không tìm thấy cửa hàng" action={<Link className="btn" to="/">Về trang chủ</Link>} />
      </section>
    );
  }
  if (!target) return <Loading />;
  const q = params.toString();
  return <Navigate to={`/shops/${target}${q ? `?${q}` : ""}`} replace />;
}
