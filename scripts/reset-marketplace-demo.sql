-- Reset catalog/shop data for marketplace demo (dev only).
-- Run: psql -U postgres -h localhost -f scripts/reset-marketplace-demo.sql

DROP DATABASE IF EXISTS shop_db;
CREATE DATABASE shop_db;

\c product_db
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

\c cart_db
TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE;

\c order_db
TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
