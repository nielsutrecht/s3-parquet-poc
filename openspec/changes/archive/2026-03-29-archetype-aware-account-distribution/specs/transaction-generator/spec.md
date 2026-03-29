## MODIFIED Requirements

### Requirement: Batch async generator interface
`pipeline/src/generator.ts` SHALL export a `generateTransactions(config: GeneratorConfig)` async generator function that yields objects of shape `{ year: number, month: number, transactions: Transaction[] }` — one batch per calendar month from `startYear/startMonth` through `endYear/endMonth` inclusive. Users with an active churn cutoff SHALL be excluded from batches after their cutoff month.

#### Scenario: Yields one batch per month
- **WHEN** `generateTransactions` is called with a config spanning Jan 2024 – Dec 2025
- **THEN** exactly 24 batches are yielded, one per month in chronological order

#### Scenario: Each batch contains a realistic number of transactions
- **WHEN** config has `numUsers: 100`, `transactionsPerAccountPerMonth: 85`, no churn, no seasonality override
- **THEN** each batch contains a non-zero number of transactions consistent with the variable account counts drawn for those users

#### Scenario: Generator is deterministic with the same seed
- **WHEN** `generateTransactions` is called twice with identical configs including the same `seed`
- **THEN** both runs produce identical `transaction_id`, `amount`, `category` values in the same order

### Requirement: Stable account IDs across months
Account IDs SHALL be pre-generated once at generator startup using a global monotonic counter and reused across all monthly batches. The same `user_id` SHALL always have the same set of `account_id` values regardless of which month is being generated.

#### Scenario: Account IDs are stable across partitions
- **WHEN** batches for January 2024 and June 2024 are collected for user `user_0001`
- **THEN** the set of `account_id` values is identical in both batches

### Requirement: Runtime configuration via environment variables
`pipeline/src/index.ts` SHALL read the following environment variables and override the corresponding `GeneratorConfig` fields when present:

| Variable | Config field |
|---|---|
| `NUM_USERS` | `numUsers` |
| `TX_PER_ACCOUNT` | `transactionsPerAccountPerMonth` |
| `SEED` | `seed` |
| `CHURN_RATE` | `churnRate` |

`ACCOUNTS_PER_USER` SHALL NOT be supported. Invalid values SHALL be ignored with a warning logged to stderr. Missing variables SHALL fall back to `DEFAULT_CONFIG` values.

#### Scenario: TX_PER_ACCOUNT overrides default
- **WHEN** `TX_PER_ACCOUNT=850 node pipeline/dist/index.js` is run
- **THEN** the pipeline runs with `transactionsPerAccountPerMonth: 850`

#### Scenario: Invalid value falls back to default
- **WHEN** `TX_PER_ACCOUNT=notanumber node pipeline/dist/index.js` is run
- **THEN** a warning is printed to stderr and the default value is used

## REMOVED Requirements

### Requirement: accountsPerUser config field
**Reason**: Replaced by archetype-aware per-user distribution drawn at startup; a fixed count is no longer meaningful.
**Migration**: Remove any reference to `accountsPerUser` in `GeneratorConfig` or `DEFAULT_CONFIG`. Use the `ACCOUNTS_DISTRIBUTION` table in `generator.ts` instead.
