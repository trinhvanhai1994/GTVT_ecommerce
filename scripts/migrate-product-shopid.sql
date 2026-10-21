-- One-time migrate product_db for shopId (dev).
\c product_db

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS shop_id BIGINT;
UPDATE categories SET shop_id = 1 WHERE shop_id IS NULL;
ALTER TABLE categories ALTER COLUMN shop_id SET NOT NULL;

ALTER TABLE products ADD COLUMN IF NOT EXISTS shop_id BIGINT;
UPDATE products SET shop_id = 1 WHERE shop_id IS NULL;
ALTER TABLE products ALTER COLUMN shop_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_categories_shop_name ON categories (shop_id, name);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products (shop_id);

\c cart_db
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS shop_id BIGINT;
UPDATE cart_items SET shop_id = 1 WHERE shop_id IS NULL;
-- leave nullable if empty table; app will set on new adds

\c order_db
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255);
UPDATE orders SET shop_id = 1 WHERE shop_id IS NULL;
UPDATE orders SET shop_name = 'Legacy Shop' WHERE shop_name IS NULL;
ALTER TABLE orders ALTER COLUMN shop_id SET NOT NULL;
