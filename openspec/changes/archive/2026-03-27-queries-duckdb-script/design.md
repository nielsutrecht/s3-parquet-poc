## Context

24 Parquet partitions are live at `s3://transactions-037bac4/transactions/year=YYYY/month=MM/part-0.parquet`. DuckDB's `httpfs` extension can read them directly using a glob pattern. The script runs in-memory — no `.duckdb` file, no Glue catalog needed.

## Goals / Non-Goals

**Goals:**
- Single Python file, runnable with `python queries/duckdb.py`
- Reads `BUCKET_NAME` from env, constructs the S3 glob path
- Loads `httpfs` and configures AWS credentials automatically from the environment / `~/.aws`
- Runs four queries and prints labelled, formatted results
- No persistent state

**Non-Goals:**
- Matching Athena's exact output format (close enough is fine)
- CLI argument parsing or query selection flags
- Error handling beyond a clear message if `BUCKET_NAME` is missing

## Decisions

### 1. In-memory DuckDB connection (`duckdb.connect()`)
No path argument = in-memory database. Guarantees no leftover `.duckdb` files.

### 2. httpfs credential chain
`duckdb.sql("CREATE SECRET ...")` with `TYPE S3, PROVIDER CREDENTIAL_CHAIN` lets DuckDB pick up credentials from environment variables (`AWS_ACCESS_KEY_ID` etc.) or `~/.aws/credentials` automatically — same behaviour as the AWS SDK.

### 3. Glob pattern covers all partitions
```
s3://<bucket>/transactions/year=*/month=*/part-0.parquet
```
DuckDB resolves this to all 24 files in one scan. No need to union per-partition queries.

### 4. Query 2 — accounts per user: show distribution, not all 100 rows
Printing 100 rows (one per user) is noisy. Instead show: min, max, avg accounts per user, and the top 5 users by account count. More informative for a PoC.

### 5. amount sign convention
Positive = credit (salary), negative = debit (spend). Queries 3 and 4 use `amount` as-is — `MIN` will be the largest debit, `MAX` the largest credit, `AVG` the net per-transaction flow.
