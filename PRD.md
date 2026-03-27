# PRD: S3 Parquet Data PoC

## Goal

Build a minimal data system that ingests, anonymizes, and stores synthetic bank transactions as Parquet files on S3, then makes them queryable via both Athena and DuckDB. Dashboards are out of scope for now.

This is a solo learning project. Prioritize simplicity and low cost over scalability.

---

## Functional Requirements

### 1. Data Generation
- Generate synthetic bank transactions mimicking typical bank export data.
- Data model (TypeScript types):
  ```
  Transaction {
    transaction_id: string      // UUID
    user_id:        string      // synthetic, e.g. "user_0042"
    account_id:     string      // synthetic, e.g. "acc_0123"
    date:           string      // ISO 8601, e.g. "2025-11-14"
    amount:         number      // positive = credit, negative = debit
    currency:       string      // e.g. "EUR"
    description:    string      // free text, e.g. "Grocery store"
    category:       string      // e.g. "groceries", "salary", "rent"
    counterparty:   string      // name of the other party (PII, to be anonymized)
    iban:           string      // account number of counterparty (PII, to be anonymized)
  }
  ```
- Generate enough data to reach a few GB total (configurable: number of users, accounts per user, transactions per account, date range).

### 2. Anonymization
- **Remove** fields that are not needed for analysis: `counterparty`.
- **Hash** fields that are identifiers but needed for aggregation: `user_id`, `account_id`, `iban` using SHA-256. The hash is deterministic so joins still work, but values are not reversible.
- The anonymized record retains all non-PII fields unchanged.

### 3. Storage
- Write anonymized transactions as Parquet files to S3.
- Partition by year and month: `s3://<bucket>/transactions/year=YYYY/month=MM/part-*.parquet`.
- Use Snappy compression.
- Target file size: ~128MB per partition file (combine small writes).

### 4. Query Layer — Athena
- An AWS Glue Data Catalog table points to the S3 prefix.
- The table schema matches the anonymized transaction model.
- Partition projection enabled (no manual `MSCK REPAIR TABLE`).
- Sample queries must return correct results for:
  - Total distinct users
  - Number of accounts per user
  - Min / max / avg account balance, overall and per month

### 5. Query Layer — DuckDB
- A local script (TypeScript or Python) reads Parquet files directly from S3 using DuckDB's S3 support.
- Same sample queries as Athena, producing identical results.
- No persistent DuckDB database — query-on-the-fly only.

---

## Non-Functional Requirements

| Concern | Target |
|---|---|
| Data volume | A few GB of Parquet |
| Cost | < $5/month in steady state (S3 storage + occasional Athena queries) |
| Runtime | Batch job, not streaming |
| Language | TypeScript for pipeline and scripts; Python acceptable where TypeScript is a poor fit (e.g. Parquet writing) |
| IaC | Pulumi (TypeScript) |
| AWS region | Single region (eu-west-1 or us-east-1, TBD) |

---

## Out of Scope

- Dashboards / BI tooling (future phase)
- Real bank data ingestion
- Streaming / real-time pipeline
- Authentication / access control beyond IAM
- Multi-environment deployments (just one environment for the PoC)

---

## Architecture Overview

```
[Generator script]
      │  (raw transactions, in-memory)
      ▼
[Anonymizer]
      │  (hashes user_id, account_id, iban; drops counterparty)
      ▼
[Parquet writer]
      │  (batches records, writes .parquet files)
      ▼
[S3 bucket]  s3://s3-parquet-poc/transactions/year=YYYY/month=MM/
      │
      ├──► [AWS Glue Catalog + Athena]  — SQL queries from anywhere
      │
      └──► [DuckDB script]             — local ad-hoc queries
```

All infrastructure (S3 bucket, Glue database, Glue table, Athena workgroup) provisioned with Pulumi.

---

## Deliverables

1. **`infra/`** — Pulumi program that provisions S3, Glue, and Athena.
2. **`pipeline/`** — TypeScript (or Python) script that generates, anonymizes, and writes Parquet to S3.
3. **`queries/athena/`** — `.sql` files for the sample queries.
4. **`queries/duckdb/`** — TypeScript or Python script running the same queries via DuckDB.
5. This PRD.

---

## Decisions

- **`account_id` stability**: stable across months. The same account must appear in multiple monthly partitions so that per-account aggregations (balance over time, accounts per user) are meaningful.
- **Date range**: 2 years — January 2024 through December 2025. This produces 24 monthly partitions and makes per-month queries interesting.
- **Athena cost guard**: yes. Provision an Athena workgroup with a 1 GB per-query data scan limit to prevent runaway costs.
