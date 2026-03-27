## Requirements

### Requirement: DuckDB Python query script
`queries/duckdb.py` SHALL be a standalone Python 3 script that:
- Reads `BUCKET_NAME` from the environment and exits with a clear error if missing
- Opens an in-memory DuckDB connection
- Loads the `httpfs` extension and configures S3 credentials via the credential chain
- Runs four labelled queries against `s3://<bucket>/transactions/year=*/month=*/part-0.parquet`
- Prints formatted results for each query to stdout
- Requires no persistent database file

#### Scenario: Script runs end-to-end with valid credentials and bucket
- **WHEN** `BUCKET_NAME=<bucket> python queries/duckdb.py` is run with valid AWS credentials
- **THEN** all four query results are printed to stdout and the script exits 0

#### Scenario: Missing BUCKET_NAME exits with clear error
- **WHEN** `python queries/duckdb.py` is run without `BUCKET_NAME` set
- **THEN** the script prints a descriptive error message and exits non-zero before making any S3 calls

### Requirement: Query 1 — distinct users
The script SHALL print the total count of distinct `user_id` values across all partitions.

#### Scenario: Distinct user count matches generator config
- **WHEN** query 1 runs against data generated with `numUsers=100`
- **THEN** the result is 100

### Requirement: Query 2 — accounts per user distribution
The script SHALL print the min, max, and average number of accounts per user, plus the top 5 users by account count.

#### Scenario: Account distribution matches generator config
- **WHEN** query 2 runs against data generated with `accountsPerUser=10`
- **THEN** min, max, and avg accounts per user are all 10

### Requirement: Query 3 — overall amount statistics
The script SHALL print the min, max, and avg transaction `amount` across all rows.

#### Scenario: Amount stats reflect both credits and debits
- **WHEN** query 3 runs
- **THEN** min amount is negative (a debit) and max amount is positive (a salary credit)

### Requirement: Query 4 — amount statistics per month
The script SHALL print min, max, and avg `amount` grouped by `year` and `month`, ordered chronologically.

#### Scenario: Results cover all 24 months
- **WHEN** query 4 runs against Jan 2024 – Dec 2025 data
- **THEN** exactly 24 rows are returned, one per month in chronological order

### Requirement: requirements.txt
`queries/requirements.txt` SHALL exist and contain `duckdb` as the sole dependency.

#### Scenario: pip install works
- **WHEN** `pip install -r queries/requirements.txt` is run
- **THEN** duckdb is installed without errors
