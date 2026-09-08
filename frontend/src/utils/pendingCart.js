const KEY = "pendingCart";

export function savePendingCart(item) {
  sessionStorage.setItem(KEY, JSON.stringify(item));
}

export function readPendingCart() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingCart() {
  sessionStorage.removeItem(KEY);
}
