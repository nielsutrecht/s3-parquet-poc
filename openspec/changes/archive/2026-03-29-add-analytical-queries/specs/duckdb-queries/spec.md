## MODIFIED Requirements

### Requirement: DuckDB Python query script
`queries/duckdb.py` SHALL be a standalone Python 3 script that:
- Reads `BUCKET_NAME` from the environment and exits with a clear error if missing
- Opens an in-memory DuckDB connection
- Loads the `httpfs` extension and configures S3 credentials via the credential chain
- Loads SQL for each query from the corresponding file in `queries/duckdb/` and runs all ten labelled queries
- Prints formatted results for each query to stdout
- Requires no persistent database file

#### Scenario: Script runs end-to-end with valid credentials and bucket
- **WHEN** `BUCKET_NAME=<bucket> python queries/duckdb.py` is run with valid AWS credentials
- **THEN** all ten query results are printed to stdout and the script exits 0

#### Scenario: Missing BUCKET_NAME exits with clear error
- **WHEN** `python queries/duckdb.py` is run without `BUCKET_NAME` set
- **THEN** the script prints a descriptive error message and exits non-zero before making any S3 calls

### Requirement: Query 2 — accounts per user distribution
The script SHALL print the min, max, and average number of accounts per user, plus the top 5 users by account count.

#### Scenario: Account distribution reflects archetype spread
- **WHEN** query 2 runs against default config data
- **THEN** min accounts is 1 (low archetype), max accounts is 8 (high archetype), and avg is approximately 3.5
