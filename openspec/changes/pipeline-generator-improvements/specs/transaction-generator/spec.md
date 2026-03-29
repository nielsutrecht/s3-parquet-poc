## MODIFIED Requirements

### Requirement: Batch async generator interface
`pipeline/src/generator.ts` SHALL export a `generateTransactions(config: GeneratorConfig)` async generator function that yields objects of shape `{ year: number, month: number, transactions: Transaction[] }` — one batch per calendar month from `startYear/startMonth` through `endYear/endMonth` inclusive. Users with an active churn cutoff SHALL be excluded from batches after their cutoff month.

#### Scenario: Yields one batch per month
- **WHEN** `generateTransactions` is called with a config spanning Jan 2024 – Dec 2025
- **THEN** exactly 24 batches are yielded, one per month in chronological order

#### Scenario: Each batch contains the expected number of transactions
- **WHEN** config has `numUsers: 10`, `accountsPerUser: 2`, `transactionsPerAccountPerMonth: 5`, no churn, no seasonality
- **THEN** each batch contains approximately 10 × 2 × 5 transactions (within ±20% due to log-normal distribution)

#### Scenario: Generator is deterministic with the same seed
- **WHEN** `generateTransactions` is called twice with identical configs including the same `seed`
- **THEN** both runs produce identical `transaction_id`, `amount`, `category` values in the same order

### Requirement: Stable account IDs across months
Account IDs SHALL be pre-generated once at generator startup and reused across all monthly batches. The same `user_id` SHALL always have the same set of `account_id` values regardless of which month is being generated.

#### Scenario: Account IDs are stable across partitions
- **WHEN** batches for January 2024 and June 2024 are collected for user `user_0001`
- **THEN** the set of `account_id` values is identical in both batches

### Requirement: User archetype assignment
Users SHALL be assigned archetypes in round-robin order: `low → mid → high → low → ...`. Each archetype SHALL produce transactions consistent with its income tier:
- **Low income**: salary credit EUR 1,200–2,000/month; spend dominated by groceries, utilities; 60–100 base tx/account/month
- **Mid income**: salary credit EUR 3,000–5,000/month; mix of groceries, dining, subscriptions, travel; 80–130 base tx/account/month
- **High income**: salary credit EUR 8,000–15,000/month; restaurants, travel, investments, luxury; 100–160 base tx/account/month

#### Scenario: Low income user has smaller salary than high income user
- **WHEN** transactions for a low-income user and a high-income user are compared
- **THEN** the low-income salary credit amount is always less than the high-income salary credit amount

#### Scenario: Each user receives exactly one salary credit per month
- **WHEN** all transactions for a given user and month are collected
- **THEN** exactly one transaction has `category: "salary"` and a positive amount

### Requirement: Seasonal spend variation
The generator SHALL apply a per-month multiplier to transaction counts. December SHALL have the highest multiplier (≥1.2×) and January the lowest (≤0.85×). The multiplier SHALL be applied to the base `transactionsPerAccountPerMonth` value.

#### Scenario: December has more transactions than January
- **WHEN** transaction counts for December and January are compared across the same set of users
- **THEN** December has more total transactions than January

### Requirement: Recurring transactions on fixed days
Rent and subscription transactions SHALL each occur exactly once per account per month, on a fixed day of the month (not randomly distributed). The day SHALL be stable across months for a given account.

#### Scenario: Rent appears exactly once per account per month
- **WHEN** all transactions for a given account and month are collected
- **THEN** exactly one transaction has `category: "rent"`

#### Scenario: Rent always falls on day 1
- **WHEN** all rent transactions are inspected
- **THEN** every rent transaction has a date where the day component is `01`

### Requirement: Log-normal amount distribution
Spend transaction amounts SHALL be drawn from a log-normal distribution parameterised per category, such that the bulk of values fall within the category's `minAmount`/`maxAmount` range but occasional larger amounts are possible. Salary amounts remain uniformly distributed.

#### Scenario: Amounts are concentrated in expected range
- **WHEN** 1000 transactions of the same category are sampled
- **THEN** at least 80% of amounts fall within the category's minAmount–maxAmount range

### Requirement: User churn
The generator SHALL support a `churnRate` config parameter (0.0–1.0). When non-zero, a random fraction of users equal to `churnRate` SHALL stop generating transactions after a randomly assigned cutoff month. Churned users produce no transactions in batches after their cutoff.

#### Scenario: No churn when churnRate is 0
- **WHEN** `churnRate: 0` is set
- **THEN** all users appear in every monthly batch

#### Scenario: Churned users disappear after their cutoff
- **WHEN** `churnRate: 1.0` is set and a user's cutoff is month 6 of 2024
- **THEN** that user has no transactions in any batch from July 2024 onwards

### Requirement: Runtime configuration via environment variables
`pipeline/src/index.ts` SHALL read the following environment variables and override the corresponding `GeneratorConfig` fields when present:

| Variable | Config field |
|---|---|
| `NUM_USERS` | `numUsers` |
| `ACCOUNTS_PER_USER` | `accountsPerUser` |
| `TX_PER_ACCOUNT` | `transactionsPerAccountPerMonth` |
| `SEED` | `seed` |
| `CHURN_RATE` | `churnRate` |

Invalid values SHALL be ignored with a warning logged to stderr. Missing variables SHALL fall back to `DEFAULT_CONFIG` values.

#### Scenario: TX_PER_ACCOUNT overrides default
- **WHEN** `TX_PER_ACCOUNT=850 node pipeline/dist/index.js` is run
- **THEN** the pipeline runs with `transactionsPerAccountPerMonth: 850`

#### Scenario: Invalid value falls back to default
- **WHEN** `TX_PER_ACCOUNT=notanumber node pipeline/dist/index.js` is run
- **THEN** a warning is printed to stderr and the default value is used

### Requirement: Transaction field validity
Every generated `Transaction` SHALL satisfy:
- `transaction_id`: non-empty string (UUID format)
- `user_id`: format `user_NNNN` (zero-padded 4 digits)
- `account_id`: format `acc_NNNN` (zero-padded 4 digits), stable across months
- `date`: valid ISO 8601 date string within the batch's year/month
- `amount`: non-zero number (positive for credits, negative for debits)
- `currency`: `"EUR"`
- `description`: non-empty string
- `category`: one of a defined set (salary, groceries, rent, utilities, dining, transport, entertainment, subscriptions, travel, investments, luxury, health, restaurants)
- `counterparty`: non-empty string (synthetic name)
- `iban`: string matching pattern `DE\d{20}`

#### Scenario: All fields are populated
- **WHEN** any transaction from any batch is inspected
- **THEN** all 11 fields are present and non-empty
