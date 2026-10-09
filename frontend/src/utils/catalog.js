export function money(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export const STATUS_LABEL = {
  PENDING: "Chờ xử lý",
  PAYMENT_PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  PAYMENT_FAILED: "Thanh toán thất bại",
  ACTIVE: "Đang bán",
  INACTIVE: "Ngừng bán"
};

/** Happy-path steps shown on order detail / checkout. */
export const ORDER_FLOW = ["CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED"];

export const CHANNEL_LABEL = {
  EMAIL: "Email",
  CONSOLE: "Hệ thống",
  MOCK: "Demo"
};

/** Notification eventType → tiếng Việt (không hiện enum thô). */
export const EVENT_TYPE_LABEL = {
  ORDER_CREATED: "Đơn mới tạo",
  ORDER_CONFIRMED: "Đơn đã xác nhận",
  PAYMENT_SUCCESS: "Thanh toán thành công",
  PAYMENT_FAILED: "Thanh toán thất bại",
  ORDER_SHIPPED: "Đang giao hàng",
  ORDER_DELIVERED: "Đã giao hàng",
  ORDER_CANCELLED: "Đơn đã hủy",
  ORDER_STATUS_UPDATED: "Cập nhật đơn hàng"
};

/** Notification delivery status → tiếng Việt. */
export const NOTIFY_STATUS_LABEL = {
  SENT: "Đã gửi",
  FAILED: "Gửi thất bại"
};

export function labelOf(map, key, fallback = key) {
  if (key == null || key === "") return "";
  return map[key] || fallback;
}

export function formatWhen(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function flowIndex(status) {
  if (status === "CANCELLED" || status === "PAYMENT_FAILED") return -1;
  const i = ORDER_FLOW.indexOf(status);
  if (i >= 0) return i;
  if (status === "PENDING" || status === "PAYMENT_PENDING") return -0.5;
  return -1;
}

const PHOTOS = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80"
];

export function productImage(product) {
  if (product?.imageUrl) return product.imageUrl;
  const id = Number(product?.id || product?.productId || 0);
  return PHOTOS[id % PHOTOS.length];
}
