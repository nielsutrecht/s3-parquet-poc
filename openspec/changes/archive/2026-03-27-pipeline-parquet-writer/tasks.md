## 1. Dependencies

- [x] 1.1 Add `parquet-wasm`, `@apache-arrow`, and `@aws-sdk/client-s3` to `pipeline/package.json` dependencies
- [x] 1.2 Run `npm install` from repo root to install new deps

## 2. Writer implementation

- [x] 2.1 Create `pipeline/src/writer.ts` — import `parquet-wasm/node` and `@apache-arrow`
- [x] 2.2 Build Arrow `Table` from `AnonymizedTransaction[]` — typed arrays per column, explicit schema (Utf8 for strings, Float64 for amount)
- [x] 2.3 Serialize to Parquet with `WriterPropertiesBuilder` set to Snappy compression
- [x] 2.4 Upload resulting `Uint8Array` to S3 via `PutObjectCommand` at `transactions/year=YYYY/month=MM/part-0.parquet`
- [x] 2.5 Read `BUCKET_NAME` from env, throw descriptive error if missing
- [x] 2.6 Log S3 key and byte size after successful upload

## 3. Wire up

- [x] 3.1 Update `pipeline/src/index.ts` — replace the DEV-41 TODO stub with `await writeParquet({ year, month, transactions: anonymized })`

## 4. Verify

- [x] 4.1 Run `npm run build --workspace=pipeline` — compiles with no errors
- [x] 4.2 Run `npm run typecheck --workspace=pipeline` — strict mode passes
- [x] 4.3 Run `BUCKET_NAME=<your-bucket> node pipeline/dist/index.js` — confirm 24 uploads logged with S3 keys and byte sizes
