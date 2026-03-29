## Why

The current generator produces uniform, flat transaction data that makes query results uninteresting and doesn't reflect real spending behaviour. This change makes the data more realistic, increases volume to test the pipeline at scale, and makes key parameters configurable without editing source code.

## What Changes

- **Seasonal spend multiplier** — transaction counts vary by month (e.g. December +30%, January -20%)
- **Recurring transactions** — rent and subscriptions fire on fixed days each month instead of being weighted randomly
- **Log-normal amount distribution** — spending amounts follow a log-normal distribution rather than uniform random, producing a realistic long tail
- **Higher default volume** — default `transactionsPerAccountPerMonth` raised to ~850 for ~20M rows / ~1 GB Parquet
- **Churn / sparse accounts** — a configurable percentage of users go inactive partway through the date range
- **Env var configuration** — `ACCOUNTS_PER_USER` and `TX_PER_ACCOUNT` can be set at runtime without editing source; all other config keys follow the same pattern

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `transaction-generator`: requirements change for amount distribution (log-normal), seasonality, recurring transactions, churn, and env var config

## Impact

- `pipeline/src/generator.ts` — core logic changes
- `pipeline/src/types.ts` — `GeneratorConfig` may gain new optional fields (churn rate, seasonal multipliers)
- `pipeline/src/index.ts` — env var parsing for runtime config overrides
- No changes to anonymizer, writer, or infra
