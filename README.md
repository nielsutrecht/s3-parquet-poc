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
infra/       Pulumi program — S3 bucket, Glue catalog, Athena workgroup
pipeline/    Transaction generator → anonymizer → Parquet writer
queries/
  athena/    Sample SQL queries
  src/       DuckDB local query script
```

## Status

| Issue | Description | Status |
|---|---|---|
| DEV-37 | Project scaffolding | ✅ Done |
| DEV-38 | Infra: Pulumi program (S3, Glue, Athena) | ✅ Done |
| DEV-39 | Pipeline: Transaction generator | ✅ Done |
| DEV-40 | Pipeline: Anonymizer | 🔲 Backlog |
| DEV-41 | Pipeline: Parquet writer (S3 upload) | 🔲 Backlog |
| DEV-42 | Queries: Athena sample queries | 🔲 Backlog |
| DEV-43 | Queries: DuckDB script | 🔲 Backlog |

## Prerequisites

- Node.js 22 (see `.nvmrc`)
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
