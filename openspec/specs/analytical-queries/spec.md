## Requirements

### Requirement: Query 05 — archetype spend by category
The system SHALL provide a query that derives each user's archetype from their salary amounts (low: 1200–2000, mid: 3000–5000, high: 8000–15000) and returns average absolute spend per category broken down by archetype, excluding salary and rent transactions.

#### Scenario: Three archetype groups are returned
- **WHEN** query 05 runs against default config data
- **THEN** exactly three archetype values appear in the result: `low`, `mid`, `high`

#### Scenario: High income users show higher average spend
- **WHEN** query 05 results are inspected for any shared category
- **THEN** the `high` archetype average spend is greater than the `low` archetype average spend

### Requirement: Query 06 — salary-to-spend ratio per user
The system SHALL provide a query that computes per-user total salary credits, total absolute debits, and the ratio of debits to salary (spend rate), ordered by spend rate descending.

#### Scenario: All users have a positive salary total
- **WHEN** query 06 runs against default config data
- **THEN** every row has a positive `total_salary` value

#### Scenario: Spend rate reflects income tier
- **WHEN** query 06 results are inspected
- **THEN** low-income users on average have a higher spend rate than high-income users (closer to 1.0)

### Requirement: Query 07 — seasonal transaction counts by month
The system SHALL provide a query that returns the total transaction count grouped by year and month, ordered chronologically, making the seasonal multiplier visible (December peak, January dip).

#### Scenario: December has more transactions than January
- **WHEN** query 07 results are compared across years
- **THEN** December transaction count exceeds January transaction count in the same year

#### Scenario: 24 rows are returned for default date range
- **WHEN** query 07 runs against Jan 2024 – Dec 2025 data
- **THEN** exactly 24 rows are returned

### Requirement: Query 08 — category spend by month
The system SHALL provide a query that returns total absolute spend per category per month, ordered by year and month, showing which categories drive the December peak.

#### Scenario: Results cover all spend categories
- **WHEN** query 08 runs against default config data
- **THEN** categories include at least groceries, dining, transport, subscriptions, and rent

#### Scenario: December shows elevated spend across categories
- **WHEN** December rows are compared to September rows for the same year
- **THEN** December total spend is higher across most categories

### Requirement: Query 09 — recurring vs variable spend per user
The system SHALL provide a query that computes per-user monthly average fixed costs (rent + subscriptions) and variable spend, plus the ratio of fixed to total spend, ordered by fixed ratio descending.

#### Scenario: Every user has non-zero fixed costs
- **WHEN** query 09 runs against default config data
- **THEN** every user has a positive `avg_fixed_monthly` value

#### Scenario: Fixed ratio is between 0 and 1
- **WHEN** query 09 results are inspected
- **THEN** all `fixed_ratio` values are in the range (0, 1) exclusive

### Requirement: Query 10 — amount outliers by category
The system SHALL provide a query that returns the 99th-percentile amount threshold per category and the transactions that exceed it, showing the log-normal tail.

#### Scenario: Each category has a threshold
- **WHEN** query 10 runs against default config data
- **THEN** every spend category has at least one row with a `p99_threshold` value

#### Scenario: Outlier amounts exceed the threshold
- **WHEN** query 10 results are inspected
- **THEN** every returned transaction amount (absolute value) exceeds the `p99_threshold` for its category
