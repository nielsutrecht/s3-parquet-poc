## ADDED Requirements

### Requirement: Glue database
The Pulumi program SHALL create a Glue database named `s3_parquet_poc`.

#### Scenario: Glue database exists after pulumi up
- **WHEN** `pulumi up` completes
- **THEN** a Glue database named `s3_parquet_poc` exists in the AWS account

### Requirement: Glue table with anonymized transaction schema
The Pulumi program SHALL create a Glue table named `transactions` in the `s3_parquet_poc` database with the following columns:

| Column | Glue type |
|---|---|
| transaction_id | string |
| user_id | string |
| account_id | string |
| date | string |
| amount | double |
| currency | string |
| description | string |
| category | string |
| iban | string |

The table SHALL use Parquet SerDe (`org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe`), point to `s3://<bucket>/transactions/`, and be partitioned by `year` (string) and `month` (string).

#### Scenario: Glue table schema matches anonymized model
- **WHEN** the Glue table is inspected after `pulumi up`
- **THEN** it contains exactly the columns above with the correct types and no `counterparty` column

#### Scenario: Table points to correct S3 location
- **WHEN** the Glue table location is inspected
- **THEN** it points to `s3://<bucket>/transactions/`

### Requirement: Partition projection on year and month
The Glue table SHALL have partition projection configured via table parameters so that Athena can query any `year`/`month` partition without running `MSCK REPAIR TABLE`. Configuration:
- `projection.enabled`: `"true"`
- `projection.year.type`: `"integer"`, range `"2024,2030"`
- `projection.month.type`: `"injected"`
- `storage.location.template`: `s3://<bucket>/transactions/year=${year}/month=${month}`

#### Scenario: Athena can query a partition without MSCK REPAIR TABLE
- **WHEN** a Parquet file exists at `s3://<bucket>/transactions/year=2024/month=01/part-0.parquet`
- **THEN** `SELECT COUNT(*) FROM transactions WHERE year='2024' AND month='01'` returns results without running `MSCK REPAIR TABLE` first
