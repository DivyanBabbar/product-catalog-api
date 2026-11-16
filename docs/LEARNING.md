# Learning record

Date: 2026-11-13

## Caller-controlled sort expression

The initial query builder interpolated the requested sort value into `ORDER BY`. Running `node --test test/catalog-query.test.js` against that version failed 1 of 3 tests. The observed SQL contained `ORDER BY name; DROP TABLE products DESC` when passed the test sort string `name; DROP TABLE products`.

The fixed query builder maps only `name`, `price`, and `created` to known column names and binds search and category values as parameters. Re-running `node --test test/catalog-query.test.js` reported `tests 3`, `pass 3`, `fail 0`, exit code 0. The test demonstrates that the constructed query rejects the injected sort string; it is not a security audit. The local run used Node.js 24.22.1 on 2026-11-13. The PostgreSQL integration test remains unrun in this environment.

## PostgreSQL test harness fix

The first GitHub Actions run for the database suite failed after the expected negative-price constraint rejection: the same transaction remained aborted, so the following filtered query failed with PostgreSQL SQLSTATE `25P02`. I added a savepoint around the intentionally invalid insert and roll back to it before continuing. The CI run will be checked again against the new commit.
