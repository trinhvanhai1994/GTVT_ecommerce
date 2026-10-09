const storageKey = (userId) => `notifyLastSeenId:${userId ?? "anon"}`;

export function getLastSeenId(userId) {
  const raw = localStorage.getItem(storageKey(userId));
  const n = Number(raw || 0);
  return Number.isFinite(n) ? n : 0;
}

/** Đánh dấu đã xem tới id lớn nhất hiện có → badge chỉ còn thông báo mới hơn. */
export function markNotificationsSeen(items, userId) {
  const maxId = (items || []).reduce((m, n) => Math.max(m, Number(n?.id) || 0), 0);
  const prev = getLastSeenId(userId);
  if (maxId > prev) {
    localStorage.setItem(storageKey(userId), String(maxId));
  }
  window.dispatchEvent(new CustomEvent("notify:seen", { detail: { userId, lastSeenId: Math.max(prev, maxId) } }));
  return Math.max(prev, maxId);
}

export function countUnread(items, userId) {
  const last = getLastSeenId(userId);
  return (items || []).filter((n) => Number(n?.id) > last).length;
}

export function isUnread(item, userId) {
  return Number(item?.id) > getLastSeenId(userId);
}
