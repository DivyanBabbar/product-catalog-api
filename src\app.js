import express from "express";
import { buildCatalogQuery, validateProduct } from "./catalog-query.js";

export function createApp(pool) {
  const app = express();
  app.use(express.json({ limit: "32kb" }));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/products", async (req, res, next) => {
    try {
      const query = buildCatalogQuery({ ...req.query });
      const result = await pool.query(query.text, query.values);
      res.json({ data: result.rows, page: query.page, pageSize: query.pageSize });
    } catch (error) { next(error); }
  });
  app.post("/api/products", async (req, res, next) => {
    const parsed = validateProduct(req.body);
    if (parsed.error) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: parsed.error } });
    try {
      const { sku, name, category, pricePaise } = parsed.value;
      const result = await pool.query(
        "INSERT INTO products (sku, name, category, price_paise) VALUES ($1, $2, $3, $4) RETURNING id, sku, name, category, price_paise, active, created_at",
        [sku, name, category, pricePaise]
      );
      return res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      if (error.code === "23505") return res.status(409).json({ error: { code: "SKU_EXISTS", message: "SKU already exists" } });
      return next(error);
    }
  });
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } });
  });
  return app;
}
