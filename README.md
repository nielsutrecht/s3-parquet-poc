# s3-parquet-poc

A minimal data pipeline that generates synthetic bank transactions, anonymizes them, writes them as Parquet to S3, and makes them queryable via Athena and DuckDB.

Solo learning project — prioritize simplicity and low cost over scalability.

## Architecture

```
[Generator]  →  [Anonymizer]  →  [Parquet writer]  →  [S3]
                                                          │
                                              ┌───────────┴───────────┐
                                        [Athena + Glue]          [DuckDB]
```

S3 partition layout: `s3://<bucket>/transactions/year=YYYY/month=MM/part-*.parquet`

## Repo structure

```
infra/          Pulumi program — S3 bucket, Glue catalog, Athena workgroup
pipeline/       Transaction generator → anonymizer → Parquet writer
queries/
  athena/       Sample SQL queries (run via Athena console or CLI)
  duckdb.py     Local DuckDB query script — reads S3 Parquet directly
  requirements.txt
```

## Prerequisites

- Node.js 22 (see `.nvmrc`)
- Python 3 + `pip`
- AWS credentials configured (`~/.aws` or environment variables)
- [Pulumi CLI](https://www.pulumi.com/docs/install/)

## Setup

```bash
nvm use          # switch to Node 22
npm install      # install all workspace dependencies
```

## Infra

```bash
cd infra
PULUMI_CONFIG_PASSPHRASE="" pulumi stack init dev   # first time only
PULUMI_CONFIG_PASSPHRASE="" pulumi preview
PULUMI_CONFIG_PASSPHRASE="" pulumi up
```

Outputs after deploy: `bucketName`, `athenaWorkgroupName`.

To tear down:

```bash
PULUMI_CONFIG_PASSPHRASE="" pulumi destroy
```

## Pipeline

```bash
npm run build --workspace=pipeline
node pipeline/dist/index.js
```

Default config: 100 users × 10 accounts × ~85 tx/account/month × 24 months ≈ 2M rows.
Full-scale run (~20M rows) requires bumping `transactionsPerAccountPerMonth` to ~850 in `pipeline/src/generator.ts`.

## DuckDB queries

`queries/duckdb.py` reads the Parquet partitions directly from S3 using DuckDB's `httpfs` extension — no Athena, no Glue, no local download required.

### Setup

```bash
pip install -r queries/requirements.txt
```

### Running

```bash
BUCKET_NAME=transactions-037bac4 python queries/duckdb.py
```

Requires AWS credentials in `~/.aws/credentials` or the standard `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` environment variables. DuckDB picks them up automatically via the credential chain.

### How it works

The script opens an in-memory DuckDB connection (no `.duckdb` file), installs and loads the `httpfs` extension, and configures an S3 secret using the credential chain:

```python
con = duckdb.connect()
con.sql("INSTALL httpfs; LOAD httpfs")
con.sql("CREATE SECRET s3_creds (TYPE S3, PROVIDER CREDENTIAL_CHAIN)")
```

All queries scan the full partition glob in one pass:

```
s3://<bucket>/transactions/year=*/month=*/part-0.parquet
```

### The four queries

**Query 1 — distinct users**

```sql
SELECT COUNT(DISTINCT user_id) AS distinct_users
FROM read_parquet('s3://<bucket>/transactions/year=*/month=*/part-0.parquet')
```

Expected result with default config (`numUsers=100`): `100`.

**Query 2 — accounts per user distribution**

```sql
WITH accounts_per_user AS (
    SELECT user_id, COUNT(DISTINCT account_id) AS num_accounts
    FROM read_parquet('...')
    GROUP BY user_id
)
SELECT
    MIN(num_accounts) AS min_accounts,
    MAX(num_accounts) AS max_accounts,
    ROUND(AVG(num_accounts), 2) AS avg_accounts
FROM accounts_per_user
```

Plus a top-5 users by account count. With default config (`accountsPerUser=10`) min/max/avg are all 10.

**Query 3 — overall amount statistics**

```sql
SELECT
    ROUND(MIN(amount), 2) AS min_amount,
    ROUND(MAX(amount), 2) AS max_amount,
    ROUND(AVG(amount), 2) AS avg_amount
FROM read_parquet('...')
```

`amount` sign convention: positive = credit (salary), negative = debit (spend). `MIN` is the largest single debit, `MAX` is the largest salary credit.

**Query 4 — amount statistics per month**

```sql
SELECT
    year, month,
    ROUND(MIN(amount), 2) AS min_amount,
    ROUND(MAX(amount), 2) AS max_amount,
    ROUND(AVG(amount), 2) AS avg_amount
FROM read_parquet('...', hive_partitioning = true)
GROUP BY year, month
ORDER BY year ASC, month ASC
```

Returns one row per calendar month. With Jan 2024 – Dec 2025 data: exactly 24 rows.

### Example output

```
============================================================
Query 1: Distinct users
============================================================
┌────────────────┐
│ distinct_users │
├────────────────┤
│            100 │
└────────────────┘

============================================================
Query 4: Amount statistics per year/month (chronological)
============================================================
┌───────┬─────────┬────────────┬────────────┬────────────┐
│ year  │  month  │ min_amount │ max_amount │ avg_amount │
├───────┼─────────┼────────────┼────────────┼────────────┤
│  2024 │ 01      │   -4997.86 │    14699.0 │    -527.12 │
│  2024 │ 02      │   -4995.97 │    14933.0 │    -528.03 │
│   ... │ ...     │        ... │        ... │        ... │
│  2025 │ 12      │   -4999.27 │    14816.0 │    -527.53 │
└───────┴─────────┴────────────┴────────────┴────────────┘
24 rows
```

## Development

```bash
npm run build      # compile all workspaces
npm run typecheck  # type-check all workspaces
npm run lint       # lint all workspaces
```

## Data model

Raw transactions (pre-anonymization):

| Field | Type | Notes |
|---|---|---|
| transaction_id | string | UUID |
| user_id | string | `user_NNNN` |
| account_id | string | `acc_NNNN`, stable across months |
| date | string | ISO 8601 |
| amount | number | positive = credit, negative = debit |
| currency | string | EUR |
| description | string | |
| category | string | salary, groceries, rent, … |
| counterparty | string | PII — removed during anonymization |
| iban | string | PII — SHA-256 hashed during anonymization |

## Cost

Target: < $5/month in steady state (S3 storage + occasional Athena queries).
Athena workgroup enforces a 1 GB per-query scan limit.
