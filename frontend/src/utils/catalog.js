export function getNormalizedPrice(value) {
  let n = Number(value || 0);
  if (n > 0 && n < 10000) {
    n = n * 25000;
  }
  return n;
}

export function money(value) {
  const n = getNormalizedPrice(value);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(n);
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

export const TECH_FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Apple MacBook Air 13 M4",
    brand: "Apple",
    category: "Laptop",
    price: 28990000,
    originalPrice: 30990000,
    sale: "-12%",
    stock: 42,
    rating: 4.9,
    reviewCount: 328,
    sku: "ELX-LAP-001",
    description: "MacBook Air M4 mỏng nhẹ vượt trội, thời lượng pin 18 tiếng, chip Apple M4 10 nhân cực mạnh.",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    specs: {
      "Chip": "Apple M4 10-core",
      "RAM": "16GB unified",
      "SSD": "512GB",
      "Display": "13.6” Liquid Retina",
      "Battery": "Lên đến 18 giờ",
      "Weight": "1.24 kg"
    }
  },
  {
    id: 2,
    name: "Dell XPS 14 9440 OLED",
    brand: "Dell",
    category: "Laptop",
    price: 39990000,
    originalPrice: 42990000,
    sale: "-7%",
    stock: 18,
    rating: 4.8,
    reviewCount: 142,
    sku: "ELX-LAP-002",
    description: "Thiết kế tương lai vô cực, màn hình OLED 3.2K 120Hz, Intel Core Ultra 7 kết hợp NPU AI.",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80",
    specs: {
      "Chip": "Intel Core Ultra 7 155H",
      "RAM": "32GB LPDDR5x",
      "SSD": "1TB PCIe Gen4",
      "Display": "14.5” 3.2K OLED 120Hz",
      "Battery": "69.5 Whr",
      "Weight": "1.68 kg"
    }
  },
  {
    id: 3,
    name: "ASUS Zenbook S 14 OLED",
    brand: "ASUS",
    category: "Laptop",
    price: 24990000,
    originalPrice: 28990000,
    sale: "-15%",
    stock: 27,
    rating: 4.9,
    reviewCount: 95,
    sku: "ELX-LAP-003",
    description: "Vỏ nhôm gốm Ceraluminum siêu bền, pin trâu hơn 20 tiếng, hỗ trợ AI Copilot+ PC thế hệ mới.",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    specs: {
      "Chip": "Intel Core Ultra 7 258V",
      "RAM": "16GB LPDDR5x",
      "SSD": "512GB PCIe 4.0",
      "Display": "14.0” 3K 120Hz Lumina OLED",
      "Battery": "72 Whr",
      "Weight": "1.20 kg"
    }
  },
  {
    id: 4,
    name: "Lenovo Legion Pro 5 Gen 9",
    brand: "Lenovo",
    category: "Gaming",
    price: 32990000,
    originalPrice: 35990000,
    sale: "-8%",
    stock: 12,
    rating: 5.0,
    reviewCount: 210,
    sku: "ELX-GAM-004",
    description: "Cỗ máy chiến game đỉnh cao với RTX 4070, tản nhiệt Legion Coldfront 5.0 và màn hình 240Hz 100% sRGB.",
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
    specs: {
      "Chip": "AMD Ryzen 7 7745HX",
      "RAM": "32GB DDR5 5200MHz",
      "SSD": "1TB NVMe SSD",
      "Display": "16” WQXGA 240Hz 500 nits",
      "Battery": "80 Whr Super Rapid Charge",
      "Weight": "2.50 kg"
    }
  },
  {
    id: 5,
    name: "HP Spectre x360 2-in-1",
    brand: "HP",
    category: "Laptop",
    price: 35490000,
    originalPrice: 38000000,
    sale: "-7%",
    stock: 10,
    rating: 4.8,
    reviewCount: 84,
    sku: "ELX-LAP-005",
    description: "Laptop xoay gập cao cấp nhất của HP, bút cảm ứng đi kèm, màn hình 2.8K OLED và camera AI 9MP.",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    specs: {
      "Chip": "Intel Core Ultra 7 155H",
      "RAM": "16GB LPDDR5x",
      "SSD": "1TB SSD",
      "Display": "14” 2.8K OLED Cảm ứng",
      "Battery": "68 Whr",
      "Weight": "1.44 kg"
    }
  },
  {
    id: 6,
    name: "Sony WH-1000XM6 Wireless",
    brand: "Sony",
    category: "Audio",
    price: 8990000,
    originalPrice: 9990000,
    sale: "-10%",
    stock: 25,
    rating: 4.9,
    reviewCount: 430,
    sku: "ELX-AUD-006",
    description: "Tai nghe chống ồn chủ động đỉnh cao số 1 thế giới với bộ xử lý HD QN1, thời lượng pin 35 giờ.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    specs: {
      "Driver": "30mm màng vòm sợi carbon",
      "Chống ồn": "HD Noise Cancelling Processor QN1",
      "Kết nối": "Bluetooth 5.3, LDAC, Multipoint",
      "Pin": "35 giờ (Bật ANC)",
      "Sạc": "Sạc nhanh 3 phút được 3 giờ",
      "Trọng lượng": "248g"
    }
  }
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"
];

export function productImage(product) {
  if (product?.imageUrl && !product.imageUrl.includes("figma.com/api/mcp/asset")) {
    return product.imageUrl;
  }
  const id = Number(product?.id || product?.productId || 0);
  return PHOTOS[id % PHOTOS.length];
}
