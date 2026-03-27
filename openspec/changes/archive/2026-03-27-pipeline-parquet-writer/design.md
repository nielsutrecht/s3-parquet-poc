## Context

Each generator batch is already anonymized in memory. The writer receives `{ year, month, transactions: AnonymizedTransaction[] }` and must produce one Parquet file per batch at the correct S3 key. The Glue table uses partition projection, so files just need to land at the right prefix — no catalog update required.

Constraints:
- Parquet must be readable by Athena (AWS Glue/Hive-compatible) and DuckDB
- Snappy compression
- No temp files — bytes flow entirely in memory
- `BUCKET_NAME` env var provides the target bucket

## Goals / Non-Goals

**Goals:**
- `writeParquet(batch)` async function: AnonymizedTransaction[] → Parquet bytes → S3
- Snappy compression via `parquet-wasm` `WriterPropertiesBuilder`
- Arrow schema matches the 9-column `AnonymizedTransaction` type exactly
- Upload via `PutObjectCommand` with `ContentType: application/octet-stream`
- Log S3 key and byte size after each upload

**Non-Goals:**
- Multipart upload (batches are ~10–50 MB compressed; single PutObject is fine up to 5 GB)
- Read-back validation in the pipeline (manual spot-check after first run)
- Concurrent uploads (sequential is fine for a PoC batch job)
- Retry logic on S3 failures

## Decisions

### 1. parquet-wasm node build (not ESM/browser build)
`parquet-wasm` ships three targets: node, esm, and bundler. The node build (`parquet-wasm/node`) loads the WASM synchronously via `fs.readFileSync` — no async WASM init needed. Simpler than the ESM build which requires `await initParquet()`.

**Alternative:** ESM build — requires top-level await or an init wrapper; extra ceremony for no benefit.

### 2. `@apache-arrow` for table construction
`parquet-wasm` requires an Arrow `Table` as input. `@apache-arrow` is the standard JS Arrow library and a declared peer dep of `parquet-wasm`. We construct a `Table` from typed arrays (one per column) which maps directly to the columnar Parquet format.

### 3. Arrow schema column types
| Column | Arrow type | Notes |
|---|---|---|
| transaction_id | Utf8 | |
| user_id | Utf8 | SHA-256 hex (64 chars) |
| account_id | Utf8 | SHA-256 hex |
| date | Utf8 | ISO 8601 string |
| amount | Float64 | positive=credit, negative=debit |
| currency | Utf8 | always "EUR" |
| description | Utf8 | |
| category | Utf8 | |
| iban | Utf8 | SHA-256 hex |

All strings as `Utf8` (not `Dictionary`) — keeps the schema simple and compatible with Athena's `string` type mapping.

### 4. S3 key includes leading `transactions/` prefix
The Glue table location is `s3://<bucket>/transactions/` and the storage location template is `s3://<bucket>/transactions/year=${year}/month=${month}`. The writer must use zero-padded month (`01`–`12`) to match the partition projection pattern.

### 5. AWS region from environment
`@aws-sdk/client-s3` picks up region from `AWS_REGION` env var or `~/.aws/config`. No hardcoding.

## Risks / Trade-offs

- **parquet-wasm WASM init overhead** → negligible for 24 batches; WASM loads once per process.
- **Single PutObject for ~10–50 MB** → well within S3's 5 GB single-PUT limit; no issue.
- **Memory: two copies of batch data** → Arrow table + Parquet bytes both in memory briefly (~100–200 MB peak). Caller discards the transaction array after `writeParquet` returns, so GC cleans up.
- **No retry** → if an upload fails mid-run, re-running from scratch is acceptable for a PoC (generator is deterministic, same seed = same data).
