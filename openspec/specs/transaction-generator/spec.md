## ADDED Requirements

### Requirement: Batch async generator interface
`pipeline/src/generator.ts` SHALL export a `generateTransactions(config: GeneratorConfig)` async generator function that yields objects of shape `{ year: number, month: number, transactions: Transaction[] }` — one batch per calendar month from `startYear/startMonth` through `endYear/endMonth` inclusive.

#### Scenario: Yields one batch per month
- **WHEN** `generateTransactions` is called with a config spanning Jan 2024 – Dec 2025
- **THEN** exactly 24 batches are yielded, one per month in chronological order

#### Scenario: Each batch contains the expected number of transactions
- **WHEN** config has `numUsers: 10`, `accountsPerUser: 2`, `transactionsPerAccountPerMonth: 5`
- **THEN** each batch contains 10 × 2 × 5 = 100 transactions

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
- **Low income**: salary credit EUR 1,200–2,000/month; spend dominated by groceries, utilities, rent; 60–100 tx/account/month
- **Mid income**: salary credit EUR 3,000–5,000/month; mix of groceries, dining, subscriptions, travel; 80–130 tx/account/month
- **High income**: salary credit EUR 8,000–15,000/month; restaurants, travel, investments, luxury; 100–160 tx/account/month

#### Scenario: Low income user has smaller salary than high income user
- **WHEN** transactions for a low-income user and a high-income user are compared
- **THEN** the low-income salary credit amount is always less than the high-income salary credit amount

#### Scenario: Each user receives exactly one salary credit per month
- **WHEN** all transactions for a given user and month are collected
- **THEN** exactly one transaction has `category: "salary"` and a positive amount

### Requirement: Transaction field validity
Every generated `Transaction` SHALL satisfy:
- `transaction_id`: non-empty string (UUID format)
- `user_id`: format `user_NNNN` (zero-padded 4 digits)
- `account_id`: format `acc_NNNN` (zero-padded 4 digits), stable across months
- `date`: valid ISO 8601 date string within the batch's year/month
- `amount`: non-zero number (positive for credits, negative for debits)
- `currency`: `"EUR"`
- `description`: non-empty string
- `category`: one of a defined set (salary, groceries, rent, utilities, dining, transport, entertainment, subscriptions, travel, investments)
- `counterparty`: non-empty string (synthetic name)
- `iban`: string matching pattern `DE\d{20}`

#### Scenario: All fields are populated
- **WHEN** any transaction from any batch is inspected
- **THEN** all 11 fields are present and non-empty
