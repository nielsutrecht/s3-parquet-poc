## 1. Create queries/duckdb/ directory and extract existing queries

- [x] 1.1 Create `queries/duckdb/` directory
- [x] 1.2 Extract Query 1 SQL from `duckdb.py` into `queries/duckdb/01_distinct_users.sql`
- [x] 1.3 Extract Query 2 SQL from `duckdb.py` into `queries/duckdb/02_accounts_per_user.sql`
- [x] 1.4 Extract Query 3 SQL from `duckdb.py` into `queries/duckdb/03_amount_stats.sql`
- [x] 1.5 Extract Query 4 SQL from `duckdb.py` into `queries/duckdb/04_amount_stats_by_month.sql`

## 2. Refactor duckdb.py to load SQL from files

- [x] 2.1 Replace each inline SQL string in `duckdb.py` with `open('queries/duckdb/NN_name.sql').read().format(bucket=bucket)`
- [x] 2.2 Verify script output is unchanged by running against existing data (or reviewing manually)

## 3. New Athena SQL files (05–10)

- [x] 3.1 Write `queries/athena/05_archetype_spend.sql` — avg absolute spend by category × archetype (CASE on salary)
- [x] 3.2 Write `queries/athena/06_salary_to_spend_ratio.sql` — per user: total salary, total debits, spend rate
- [x] 3.3 Write `queries/athena/07_seasonal_tx_counts.sql` — tx count by year/month ordered chronologically
- [x] 3.4 Write `queries/athena/08_category_by_month.sql` — total spend by category × month
- [x] 3.5 Write `queries/athena/09_recurring_vs_variable.sql` — per user avg fixed vs variable monthly spend + ratio
- [x] 3.6 Write `queries/athena/10_amount_outliers.sql` — p99 threshold per category + transactions exceeding it

## 4. New DuckDB SQL files (05–10)

- [x] 4.1 Write `queries/duckdb/05_archetype_spend.sql` — same logic as Athena 05, FROM read_parquet('{bucket}/...')
- [x] 4.2 Write `queries/duckdb/06_salary_to_spend_ratio.sql`
- [x] 4.3 Write `queries/duckdb/07_seasonal_tx_counts.sql`
- [x] 4.4 Write `queries/duckdb/08_category_by_month.sql`
- [x] 4.5 Write `queries/duckdb/09_recurring_vs_variable.sql`
- [x] 4.6 Write `queries/duckdb/10_amount_outliers.sql`

## 5. Add new queries to duckdb.py

- [x] 5.1 Add Query 5 section to `duckdb.py` (load from file, print header + results)
- [x] 5.2 Add Query 6 section
- [x] 5.3 Add Query 7 section
- [x] 5.4 Add Query 8 section
- [x] 5.5 Add Query 9 section
- [x] 5.6 Add Query 10 section

## 6. Verification

- [x] 6.1 Run `duckdb.py` locally against real S3 data and confirm all 10 queries execute without error
- [x] 6.2 Confirm query 07 shows December > January transaction counts
- [x] 6.3 Confirm query 05 shows three archetype groups with increasing spend low → high
