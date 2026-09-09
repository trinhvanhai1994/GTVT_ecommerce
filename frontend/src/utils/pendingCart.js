const K = "pendingCart";
export const savePendingCart = (v) => sessionStorage.setItem(K, JSON.stringify(v));
export const readPendingCart = () => { try { return JSON.parse(sessionStorage.getItem(K)); } catch { return null; } };
export const clearPendingCart = () => sessionStorage.removeItem(K);
