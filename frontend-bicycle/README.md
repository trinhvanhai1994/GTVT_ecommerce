# VOLTRA — frontend-bicycle

Storefront React (Vite) cho website bán xe đạp điện. Giao diện tối, accent lime/cyan, hiệu ứng vệt năng lượng và bánh xe quay.

## Chạy local

```bat
cd frontend-bicycle
npm install
npm run dev
```

Mở http://localhost:5174

Frontend gốc (`frontend`) vẫn chạy cổng **5173**. Project này độc lập cổng **5174**.

## Trang

- `/` hero kinetic + canvas energy trail
- `/shop` lọc dòng xe
- `/bikes/:id` chi tiết + bánh quay
- `/tech` SVG ride path
- `/cart` `/checkout` giỏ localStorage (demo)

## Stack

Vite 8 · React 19 · React Router 7 · CSS custom (không Tailwind)
