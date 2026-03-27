## ADDED Requirements

### Requirement: Query 1 — distinct users
`queries/athena/01_distinct_users.sql` SHALL count the total number of distinct `user_id` values across all partitions.

#### Scenario: Distinct user count matches generator config
- **WHEN** the query runs against data generated with `numUsers=100`
- **THEN** the result is 100

### Requirement: Query 2 — accounts per user
`queries/athena/02_accounts_per_user.sql` SHALL return the number of distinct accounts per user, ordered descending by account count.

#### Scenario: Account count matches generator config
- **WHEN** the query runs against data generated with `accountsPerUser=10`
- **THEN** every user has exactly 10 accounts

### Requirement: Query 3 — overall amount statistics
`queries/athena/03_amount_stats.sql` SHALL return the min, max, and average transaction `amount` across all rows.

#### Scenario: Amount stats reflect credits and debits
- **WHEN** the query runs
- **THEN** min amount is negative (a debit) and max amount is positive (a salary credit)

### Requirement: Query 4 — amount statistics per month
`queries/athena/04_amount_stats_by_month.sql` SHALL return min, max, and average `amount` grouped by `year` and `month`, ordered chronologically.

#### Scenario: Results cover all 24 months
- **WHEN** the query runs against Jan 2024 – Dec 2025 data
- **THEN** exactly 24 rows are returned, one per month in chronological order

### Requirement: Query files are standalone
Each `.sql` file SHALL be runnable as-is in the Athena console against the `s3_parquet_poc.transactions` table with no substitution required.

#### Scenario: Query executes without modification
- **WHEN** a `.sql` file is pasted into the Athena query editor and run
- **THEN** the query executes successfully and returns results
