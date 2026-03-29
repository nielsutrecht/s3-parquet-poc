## Requirements

### Requirement: DuckDB SQL file directory
A `queries/duckdb/` directory SHALL exist containing one `.sql` file per query (01–10), each containing a complete DuckDB-flavoured SQL query using `read_parquet('{bucket}/transactions/year=*/month=*/part-0.parquet')` as the data source. The `{bucket}` placeholder SHALL be the only Python format string token in each file.

#### Scenario: All 10 query files exist
- **WHEN** `queries/duckdb/` is listed
- **THEN** files `01_distinct_users.sql` through `10_amount_outliers.sql` are present

#### Scenario: Files contain valid SQL after bucket substitution
- **WHEN** `{bucket}` is replaced with a valid S3 URI in any file
- **THEN** the result is syntactically valid DuckDB SQL

### Requirement: duckdb.py loads SQL from files
`duckdb.py` SHALL load each query's SQL from the corresponding file in `queries/duckdb/` using `open().read()` and `.format(bucket=bucket)` for interpolation, rather than hardcoding SQL strings inline.

#### Scenario: Script output is unchanged after refactor
- **WHEN** `duckdb.py` is run before and after the refactor against the same data
- **THEN** the printed output (section headers, query results) is identical
