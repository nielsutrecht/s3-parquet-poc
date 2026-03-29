## Why

The existing 4 queries are basic schema validation (row counts, field stats) and don't demonstrate the analytical patterns the synthetic data was designed to produce. This change adds meaningful queries that surface archetype behaviour, seasonal signals, spend composition, and outliers — and restructures the DuckDB runner to load SQL from files rather than hardcoding it inline.

## What Changes

- Create `queries/duckdb/` directory with SQL files for all 10 queries (01–04 extracted from `duckdb.py`, 05–10 new)
- Add 6 new Athena SQL files (`queries/athena/05`–`10`)
- Add 6 new DuckDB SQL files (`queries/duckdb/05`–`10`) with equivalent logic using `read_parquet`
- Refactor `duckdb.py` to read SQL from `queries/duckdb/*.sql` files instead of inline strings; keep curated section headers and narrative

## Capabilities

### New Capabilities

- `analytical-queries`: Six analytical SQL queries covering archetype spend breakdown, salary-to-spend ratio, seasonal transaction volume, category spend by month, recurring vs variable spend, and amount outliers
- `duckdb-query-files`: SQL files for DuckDB queries extracted from `duckdb.py` into `queries/duckdb/`, with `duckdb.py` reading from them

### Modified Capabilities

- `duckdb-queries`: `duckdb.py` behaviour changes — SQL is now loaded from files rather than hardcoded; output and narrative structure remain the same

## Impact

- `queries/athena/` — 6 new `.sql` files added
- `queries/duckdb/` — new directory; 10 `.sql` files (4 extracted + 6 new)
- `queries/duckdb.py` — refactored to read from files; no change to output format
