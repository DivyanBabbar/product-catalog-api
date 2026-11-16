import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { readFile } from "node:fs/promises";
import { buildCatalogQuery } from "../src/catalog-query.js";

test("PostgreSQL constraints and filtered pagination", { skip: process.env.RUN_DB_TESTS !== "1" }, async (t) => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required when RUN_DB_TESTS=1");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  t.after(() => client.end());
  await client.query("BEGIN");
  t.after(() => client.query("ROLLBACK"));
  await client.query(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));
  await client.query("INSERT INTO products (sku, name, category, price_paise) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)", ["T-1", "Algorithms", "books", 2000, "T-2", "Notebook", "stationery", 350]);
  await client.query("SAVEPOINT before_invalid_product");
  await assert.rejects(client.query("INSERT INTO products (sku, name, category, price_paise) VALUES ($1, $2, $3, $4)", ["T-3", "Invalid", "books", -1]), { code: "23514" });
  await client.query("ROLLBACK TO SAVEPOINT before_invalid_product");
  const query = buildCatalogQuery({ category: "books", sort: "price", direction: "asc", page: "1", pageSize: "1" });
  const result = await client.query(query.text, query.values);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].sku, "T-1");
});
