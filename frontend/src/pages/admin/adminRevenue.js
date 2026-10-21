const REVENUE_STATUSES = new Set(["CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED"]);

export function aggregateShopRevenue(orders, shops) {
  const map = new Map();
  for (const s of shops || []) {
    map.set(Number(s.id), {
      shopId: s.id,
      name: s.name,
      slug: s.slug,
      status: s.status,
      revenue: 0,
      orderCount: 0
    });
  }
  for (const o of orders || []) {
    if (!REVENUE_STATUSES.has(o.status)) continue;
    const sid = Number(o.shopId);
    let row = map.get(sid);
    if (!row) {
      row = {
        shopId: sid,
        name: o.shopName || `Shop #${sid}`,
        slug: "",
        status: "APPROVED",
        revenue: 0,
        orderCount: 0
      };
      map.set(sid, row);
    }
    row.revenue += Number(o.totalAmount || 0);
    row.orderCount += 1;
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

export function platformGmv(orders) {
  return (orders || [])
    .filter((o) => REVENUE_STATUSES.has(o.status))
    .reduce((s, o) => s + Number(o.totalAmount || 0), 0);
}
