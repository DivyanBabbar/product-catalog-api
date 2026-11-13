# Product Catalog API

A small Node.js, Express, and PostgreSQL API for a searchable product catalog. Product prices use integer paise. PostgreSQL constraints enforce unique SKUs, required text, and non-negative prices; the API uses parameterized values and an allowlist for sort columns.

## Run

Requires Node.js 20+, PostgreSQL 15+, and npm.

```sh
npm install
$env:DATABASE_URL = 'postgres://user:password@localhost:5432/catalog'
psql $env:DATABASE_URL -f db/schema.sql
npm test
npm start
```

`GET /api/products` supports `category`, `q`, `sort=name|price|created`, `direction=asc|desc`, `page`, and `pageSize` (capped at 100). `POST /api/products` accepts `sku`, `name`, `category`, and integer `pricePaise`. Duplicate SKUs return 409.

## Tests

`npm test` runs dependency-free query construction and validation tests plus a PostgreSQL integration test that skips unless `RUN_DB_TESTS=1`. Run the integration test against a disposable database with:

```sh
$env:RUN_DB_TESTS = '1'
npm run test:integration
```

The integration test wraps its fixture writes in a transaction and rolls them back. It verifies a database check constraint and one filtered, sorted, paginated query. Do not point it at a database containing work you need to keep.

## Learning record

An initial query draft interpolated the requested sort string into `ORDER BY`. A query-builder regression test with `sort=name; DROP TABLE products` exposed that the SQL text could contain caller-controlled syntax. The fixed query selects a column from a fixed allowlist; filter values remain bound parameters. `node --test test/catalog-query.test.js` checks the fixed query text and bound values. This demonstrates a query-construction safeguard; it is not a security audit.

## Scope

This is a learning API with a single catalog table. It has no authentication, authorization, inventory, deployment, or production hardening.
