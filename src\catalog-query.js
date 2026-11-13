const sortColumns = new Map([
  ["name", "name"],
  ["price", "price_paise"],
  ["created", "created_at"]
]);

export function parsePage(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function buildCatalogQuery({ category, q, sort, direction, page, pageSize }) {
  const clauses = ["active = TRUE"];
  const values = [];
  if (typeof category === "string" && category.trim()) {
    values.push(category.trim());
    clauses.push(`category = $${values.length}`);
  }
  if (typeof q === "string" && q.trim()) {
    values.push(`%${q.trim()}%`);
    clauses.push(`(name ILIKE $${values.length} OR sku ILIKE $${values.length})`);
  }
  const column = sortColumns.get(sort) ?? "created_at";
  const order = direction === "asc" ? "ASC" : "DESC";
  const limit = parsePage(pageSize, 20, 100);
  const pageNumber = parsePage(page, 1, 1_000_000);
  const offset = (pageNumber - 1) * limit;
  values.push(limit, offset);
  return {
    text: `SELECT id, sku, name, category, price_paise, active, created_at FROM products WHERE ${clauses.join(" AND ")} ORDER BY ${column} ${order}, id ASC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
    page: pageNumber,
    pageSize: limit
  };
}

export function validateProduct(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "body must be a JSON object" };
  const sku = typeof input.sku === "string" ? input.sku.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  if (!sku || sku.length > 40) return { error: "sku is required and must be 40 characters or fewer" };
  if (!name || name.length > 160) return { error: "name is required and must be 160 characters or fewer" };
  if (!category || category.length > 80) return { error: "category is required and must be 80 characters or fewer" };
  if (!Number.isSafeInteger(input.pricePaise) || input.pricePaise < 0) return { error: "pricePaise must be a non-negative safe integer" };
  return { value: { sku, name, category, pricePaise: input.pricePaise } };
}
