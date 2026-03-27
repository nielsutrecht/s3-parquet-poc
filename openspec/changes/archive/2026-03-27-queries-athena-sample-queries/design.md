## Context

The Glue table `s3_parquet_poc.transactions` is live with partition projection on `year` and `month`. Athena workgroup `s3-parquet-poc` enforces a 1 GB per-query scan limit. The four queries mirror DEV-43's DuckDB queries so results are directly comparable.

## Goals / Non-Goals

**Goals:**
- Four standalone `.sql` files, each runnable as-is in the Athena console or via `aws athena start-query-execution`
- Results verifiable against the known generator config (`numUsers=100`, `accountsPerUser=10`, Jan 2024–Dec 2025)

**Non-Goals:**
- Parameterisation or query templating
- Saved queries in the Athena console
- Result comparison automation

## Decisions

### 1. One file per query

Each query gets its own file (`01_distinct_users.sql`, `02_accounts_per_user.sql`, etc.) rather than a single multi-statement file. Athena executes one statement at a time, so separate files map directly to how they're actually run.

### 2. Replace `sample.sql`, don't add alongside it

`sample.sql` is a placeholder with no real content. Replacing it keeps the directory clean.

### 3. Use the Glue table name, not `read_parquet`

Athena queries use `FROM "s3_parquet_poc"."transactions"` — the Glue catalog handles the S3 path and partitioning. No raw S3 paths needed (unlike DuckDB).

### 4. Partition pruning via WHERE clause

Queries that don't need all partitions (e.g., per-month) benefit from Athena's partition projection. Query 4 uses `GROUP BY year, month` which naturally hits all 24 partitions but reads no more than needed.
