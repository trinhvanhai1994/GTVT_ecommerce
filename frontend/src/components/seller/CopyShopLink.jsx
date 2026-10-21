import { useState } from "react";
import { useDialog } from "../../context/DialogContext";

export default function CopyShopLink({ shopId, slug }) {
  const { toast } = useDialog();
  const [copied, setCopied] = useState(false);
  const path = `/shops/${shopId}`;
  const full = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      toast({ title: "Đã sao chép", message: "Link vitrine — mở tab ẩn danh để xem như khách.", variant: "ok" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Không sao chép được", message: full, variant: "error" });
    }
  };

  return (
    <div className="copy-shop-link">
      <code className="shop-url">{slug ? `/${slug}` : path}</code>
      <button type="button" className="btn btn-sm btn-ghost" onClick={copy}>
        {copied ? "Đã copy" : "Sao chép link cửa hàng"}
      </button>
    </div>
  );
}
