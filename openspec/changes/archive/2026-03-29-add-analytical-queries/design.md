## Context

`queries/duckdb.py` currently hardcodes all SQL as inline Python strings. `queries/athena/` has 4 standalone `.sql` files. The two are structurally divergent — adding a new query means editing Python source and writing a separate Athena file. This change introduces `queries/duckdb/` to hold DuckDB-flavoured SQL files and refactors `duckdb.py` to load them, while keeping the curated output format.

## Goals / Non-Goals

**Goals:**
- Parallel file structure: every query exists as both `queries/athena/NN_name.sql` and `queries/duckdb/NN_name.sql`
- `duckdb.py` reads SQL from files — no inline query strings
- `duckdb.py` output format (section headers, narrative, `.show()`) unchanged
- 6 new analytical queries (05–10) in both directories

**Non-Goals:**
- Generic auto-runner (duckdb.py stays curated, not a glob-and-run script)
- Shared SQL files between Athena and DuckDB (FROM clauses differ too much)
- Churn detection queries
- Query result caching or output files

## Decisions

### Parallel files over shared SQL

The FROM clause differs fundamentally between engines:
- Athena: `FROM "s3_parquet_poc"."transactions"`
- DuckDB: `FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet')`

A shared-file approach would require templating or a compatibility VIEW. Parallel files are simpler and more readable — the SQL in each file is complete and runnable as-is.

### duckdb.py reads files via `open()`, not `importlib` or subprocess

Each query section in `duckdb.py` uses `open('queries/duckdb/NN_name.sql').read()` and passes the string to `con.sql()`. The bucket glob placeholder `{bucket}` in DuckDB SQL files is interpolated at load time with Python's `.format()`. This keeps the files valid SQL (no custom template syntax) while still being parameterised.

### Archetype derivation via CASE on salary amount

Archetype is not stored in the data. It is derived at query time using the known non-overlapping salary ranges:
```sql
CASE
  WHEN amount BETWEEN 1200 AND 2000  THEN 'low'
  WHEN amount BETWEEN 3000 AND 5000  THEN 'mid'
  WHEN amount BETWEEN 8000 AND 15000 THEN 'high'
END
```
This is a subquery pattern used in queries 05 and 06.

## Risks / Trade-offs

- [File path coupling] `duckdb.py` assumes it's run from the repo root (`queries/duckdb/NN.sql`). → Mitigation: document in script header; consistent with current usage pattern.
- [SQL duplication] Logic is duplicated across Athena and DuckDB files. → Accepted trade-off for readability; the files are short and the duplication is intentional.
- [Bucket placeholder] DuckDB SQL files contain `{bucket}` which isn't valid SQL on its own. → Files are clearly named `queries/duckdb/` and the README notes they require the runner.
