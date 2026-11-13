CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE CHECK (length(trim(sku)) BETWEEN 1 AND 40),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 160),
  category TEXT NOT NULL CHECK (length(trim(category)) BETWEEN 1 AND 80),
  price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_created_idx ON products (category, created_at DESC, id DESC);
