## 1. Setup

- [x] 1.1 Create `queries/requirements.txt` with `duckdb`
- [x] 1.2 Install: `pip install -r queries/requirements.txt`

## 2. Script

- [x] 2.1 Create `queries/duckdb.py` — read `BUCKET_NAME` from env, exit with error if missing
- [x] 2.2 Open in-memory DuckDB connection, load `httpfs`, configure S3 credential chain
- [x] 2.3 Implement Query 1: `COUNT(DISTINCT user_id)`
- [x] 2.4 Implement Query 2: accounts per user — min/max/avg + top 5
- [x] 2.5 Implement Query 3: overall `MIN/MAX/AVG(amount)`
- [x] 2.6 Implement Query 4: `MIN/MAX/AVG(amount)` grouped by `year`, `month` ordered chronologically
- [x] 2.7 Update `queries/src/duckdb.ts` placeholder with comment pointing to `duckdb.py`

## 3. Verify

- [x] 3.1 Run `BUCKET_NAME=transactions-037bac4 python queries/duckdb.py` — all four queries print results
- [x] 3.2 Confirm Query 1 returns 100 (matches `numUsers=100`)
- [x] 3.3 Confirm Query 4 returns exactly 24 rows
