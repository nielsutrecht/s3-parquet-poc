## Why

The pipeline can generate and anonymize transactions but currently does nothing with them. This change adds the final stage: writing each monthly batch as a Parquet file to S3, making the data available for Athena and DuckDB queries.

## What Changes

- Add `parquet-wasm` and `@aws-sdk/client-s3` (+ `@apache-arrow`) to `pipeline/package.json`
- Add `pipeline/src/writer.ts` — `writeParquet(batch)` converts an anonymized batch to Arrow, serializes as Parquet (Snappy), and uploads to S3
- Update `pipeline/src/index.ts` — replace the DEV-41 TODO stub with a `writeParquet` call
- S3 bucket name read from `BUCKET_NAME` environment variable

## Capabilities

### New Capabilities

- `parquet-writer`: Converts `AnonymizedTransaction[]` to Snappy-compressed Parquet and uploads to S3 under `transactions/year=YYYY/month=MM/part-0.parquet`

### Modified Capabilities

<!-- none -->

## Impact

- Adds `parquet-wasm`, `@apache-arrow`, `@aws-sdk/client-s3` to `pipeline/package.json`
- Modifies `pipeline/src/index.ts` (replaces TODO stub)
- Adds `pipeline/src/writer.ts`
- Requires `BUCKET_NAME` env var and valid AWS credentials at runtime
