## Why

The pipeline is complete and 24 partitions are live on S3. This change adds the DuckDB query layer: a local Python script that reads those Parquet files directly from S3 and runs the four sample queries, proving the data is correct and queryable without Athena.

## What Changes

- Add `queries/duckdb.py` — Python script running four sample queries via DuckDB httpfs
- Add `queries/requirements.txt` — single entry: `duckdb`
- Replace the TypeScript `queries/src/duckdb.ts` placeholder with a note pointing to the Python script

## Capabilities

### New Capabilities

- `duckdb-queries`: Python script that connects to DuckDB in-memory, loads the httpfs extension, and runs four queries against S3 Parquet files, printing formatted results to stdout

### Modified Capabilities

<!-- none -->

## Impact

- Adds `queries/duckdb.py` and `queries/requirements.txt`
- Requires Python 3 and `pip install duckdb` (or `pip install -r queries/requirements.txt`)
- Requires `BUCKET_NAME` env var and AWS credentials at runtime
- `queries/src/duckdb.ts` placeholder updated with a redirect comment
