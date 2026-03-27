## ADDED Requirements

### Requirement: writeParquet function
`pipeline/src/writer.ts` SHALL export an async `writeParquet(batch: { year: number, month: number, transactions: AnonymizedTransaction[] }): Promise<void>` function that:
- Converts the transactions to an Apache Arrow `Table` with the 9-column schema
- Serializes the table to Parquet format with Snappy compression
- Uploads the resulting bytes to S3 at key `transactions/year=YYYY/month=MM/part-0.parquet` (month zero-padded to 2 digits)
- Reads the target bucket name from the `BUCKET_NAME` environment variable
- Logs the S3 key and compressed byte size after a successful upload

#### Scenario: File lands at correct S3 key
- **WHEN** `writeParquet({ year: 2024, month: 1, transactions })` is called
- **THEN** a file is created at `s3://<bucket>/transactions/year=2024/month=01/part-0.parquet`

#### Scenario: Month is zero-padded
- **WHEN** `writeParquet({ year: 2024, month: 3, transactions })` is called
- **THEN** the S3 key contains `month=03`, not `month=3`

#### Scenario: Output is valid Parquet with Snappy compression
- **WHEN** the uploaded file is downloaded and inspected
- **THEN** it is a valid Parquet file with Snappy-compressed row groups

#### Scenario: Output is readable by DuckDB
- **WHEN** `SELECT COUNT(*) FROM read_parquet('s3://<bucket>/transactions/year=2024/month=01/part-0.parquet')` is run via DuckDB
- **THEN** it returns the correct row count for that batch

#### Scenario: Missing BUCKET_NAME throws a clear error
- **WHEN** `writeParquet` is called without `BUCKET_NAME` set in the environment
- **THEN** the function throws an error with a descriptive message before attempting any S3 call

### Requirement: Arrow schema matches AnonymizedTransaction
The Arrow `Table` constructed by `writeParquet` SHALL have exactly 9 columns matching the `AnonymizedTransaction` type: `transaction_id`, `user_id`, `account_id`, `date`, `amount`, `currency`, `description`, `category`, `iban`. String fields use `Utf8`; `amount` uses `Float64`.

#### Scenario: Schema column names match Glue table
- **WHEN** the Parquet file is queried via Athena
- **THEN** all 9 column names resolve correctly against the Glue table schema with no missing or extra columns
