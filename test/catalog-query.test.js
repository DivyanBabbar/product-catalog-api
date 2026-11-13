import test from "node:test";
import assert from "node:assert/strict";
import { buildCatalogQuery, parsePage, validateProduct } from "../src/catalog-query.js";

test("filters are parameterized and sort columns are allowlisted", () => {
  const query = buildCatalogQuery({ category: " books ", q: "x%' OR TRUE --", sort: "name; DROP TABLE products", direction: "desc", page: "2", pageSize: "10" });
  assert.deepEqual(query.values, ["books", "%x%' OR TRUE --%", 10, 10]);
  assert.match(query.text, /category = \$1/);
  assert.match(query.text, /name ILIKE \$2 OR sku ILIKE \$2/);
  assert.match(query.text, /ORDER BY created_at DESC/);
  assert.doesNotMatch(query.text, /DROP TABLE/);
});

test("pagination rejects zero and invalid values and caps page size", () => {
  assert.equal(parsePage("0", 1, 100), 1);
  assert.equal(parsePage("many", 20, 100), 20);
  assert.equal(parsePage("1000", 20, 100), 100);
});

test("product input uses paise as a non-negative integer", () => {
  assert.deepEqual(validateProduct({ sku: " A1 ", name: " Book ", category: " books ", pricePaise: 12550 }), { value: { sku: "A1", name: "Book", category: "books", pricePaise: 12550 } });
  assert.match(validateProduct({ sku: "A1", name: "Book", category: "books", pricePaise: 12.5 }).error, /integer/);
});
