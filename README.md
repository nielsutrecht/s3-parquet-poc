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

- Node.js 22+ (`.nvmrc` pins v22; any newer version works)
- Python 3 + `pip3`
- AWS credentials configured (`~/.aws` or environment variables)
- [Pulumi CLI](https://www.pulumi.com/docs/install/)

## Setup

```bash
cp .env.example .env   # copy and fill in BUCKET_NAME after deploying infra
npm install            # install all workspace dependencies
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
node --env-file=.env pipeline/dist/index.js
```

Default config: 100 users × ~3.5 accounts/user (varies by archetype) × ~85 tx/account/month × 24 months ≈ 700K rows.

### Environment variables

Set in `.env` (copy from `.env.example`). All pipeline vars are optional — defaults are used if unset.

| Variable | Default | Description |
|---|---|---|
| `BUCKET_NAME` | — | S3 bucket to write Parquet files to (required) |
| `NUM_USERS` | `100` | Number of synthetic users |
| `TX_PER_ACCOUNT` | `85` | Base transactions per account per month (seasonal multiplier applied on top) |
| `SEED` | `42` | PRNG seed — same seed = identical output |
| `CHURN_RATE` | `0` | Fraction of users (0.0–1.0) that go inactive partway through the date range |

Full-scale run (~20M rows / ~1 GB Parquet):

```bash
node --env-file=.env pipeline/dist/index.js
```

To delete only the S3 data (e.g. before a regeneration run) without tearing down infra:

```bash
aws s3 rm s3://<bucket>/transactions/ --recursive
```

### Generator behaviour

- **3 user archetypes** — low / mid / high income, assigned round-robin
- **Seasonal spend** — transaction counts scaled by month (December ×1.3, January ×0.8)
- **Recurring transactions** — rent on day 1, subscriptions on a stable per-account day each month
- **Log-normal amounts** — realistic long tail; most transactions are small, occasional larger ones
- **Churn** — users with a cutoff month produce no transactions after it (`CHURN_RATE=0` by default)

## Athena queries

The four sample queries live in `queries/athena/` as standalone `.sql` files. Run them in the Athena console (workgroup: `s3-parquet-poc`) or via the AWS CLI.

### Glue table

- Database: `s3_parquet_poc`, Table: `transactions`
- Partition projection on `year` (integer, 2024–2030) and `month` (enum, `01–12`)
- No `MSCK REPAIR TABLE` needed — partition projection handles discovery automatically

### The four queries

**`01_distinct_users.sql` — distinct users**

```sql
SELECT COUNT(DISTINCT user_id) AS distinct_users
FROM "s3_parquet_poc"."transactions";
```

Expected with default config (`numUsers=100`): `100`.

**`02_accounts_per_user.sql` — accounts per user**

```sql
SELECT user_id, COUNT(DISTINCT account_id) AS num_accounts
FROM "s3_parquet_poc"."transactions"
GROUP BY user_id
ORDER BY num_accounts DESC;
```

Account counts vary by archetype: low income 1–4, mid income 2–6, high income 3–8.

**`03_amount_stats.sql` — overall amount statistics**

```sql
SELECT
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount,
    AVG(amount) AS avg_amount
FROM "s3_parquet_poc"."transactions";
```

`amount` sign convention: positive = credit (salary), negative = debit (spend).

**`04_amount_stats_by_month.sql` — amount statistics per month**

```sql
SELECT year, month,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount,
    AVG(amount) AS avg_amount
FROM "s3_parquet_poc"."transactions"
GROUP BY year, month
ORDER BY year ASC, month ASC;
```

Returns exactly 24 rows for Jan 2024 – Dec 2025 data.

### Running via AWS CLI

```bash
aws athena start-query-execution \
  --work-group s3-parquet-poc \
  --query-string "$(cat queries/athena/01_distinct_users.sql)"
```

Results are written to `s3://<bucket>/athena-results/` and retrievable with `aws athena get-query-results`.

## DuckDB queries

`queries/duckdb.py` reads the Parquet partitions directly from S3 using DuckDB's `httpfs` extension — no Athena, no Glue, no local download required.

### Setup

```bash
python3 -m venv queries/.venv
queries/.venv/bin/pip install -r queries/requirements.txt
```

### Running

```bash
set -a && source .env && set +a
queries/.venv/bin/python queries/duckdb.py
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

Plus a top-5 users by account count. With default config, min/max/avg reflect the archetype distribution (low: 1–4, mid: 2–6, high: 3–8).

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

## Dashboarding options

The data is queryable via Athena or DuckDB — several tools connect naturally to either.

| Tool | Connects to | Notes |
|---|---|---|
| **Amazon QuickSight** | Athena | Native integration, no extra infra. SPICE caches data for fast dashboards. ~$24/month per author. |
| **Grafana** | Athena | Athena data source plugin available. Free tier covers light usage. Good for time-series style charts. |
| **Metabase** | DuckDB / Athena | Easy to self-host via Docker. DuckDB driver available as a community plugin. Low barrier to entry. |
| **Apache Superset** | Athena | Docker-friendly, native Athena support via `PyAthena`. More powerful but more setup than Metabase. |
| **Evidence** | DuckDB / Athena | Markdown + SQL → static report site. Minimal overhead, fits a PoC well, output is shareable. |
| **Jupyter + plotly** | DuckDB (local) | Zero extra infra. `pip install jupyter plotly` and reuse the DuckDB query patterns from `queries/duckdb.py`. |

For a local-first PoC, **Jupyter + DuckDB** is the lowest-friction starting point. If you want something shareable, **Evidence** is a good fit. If Athena is provisioned and you want a full BI tool, **QuickSight** is the path of least resistance within AWS.

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
