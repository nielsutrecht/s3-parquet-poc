## Context

`pipeline/src/generator.ts` produces flat, uniform transaction data. All months look the same, rent can appear zero or many times, amounts are uniformly distributed, and transaction counts don't vary seasonally. Config is hardcoded in `DEFAULT_CONFIG` — changing volume or accounts requires editing source.

## Goals / Non-Goals

**Goals:**
- Seasonal variation in transaction counts (month multipliers)
- Recurring transactions (rent, subscriptions) on fixed days — one occurrence per month per account
- Log-normal amount distribution for spend categories
- Higher default volume (~850 tx/account/month)
- Configurable `accountsPerUser` and `transactionsPerAccountPerMonth` via env vars
- Churn: a configurable fraction of users stop generating transactions after a random cutoff month

**Non-Goals:**
- Changing the Parquet schema or anonymizer
- Streaming / incremental loads
- Multi-currency support

## Decisions

### 1. Seasonal multipliers as a fixed lookup table

A `SEASONAL_MULTIPLIERS: Record<number, number>` maps month → multiplier (e.g. `12: 1.3`, `1: 0.8`). Applied to the base `transactionsPerAccountPerMonth` when computing `txCount` for each account. Simple, predictable, easy to adjust.

### 2. Recurring transactions extracted from weighted categories

Rent and subscriptions are removed from the weighted category pool and handled separately. Each account generates exactly one rent transaction on day 1 of the month, and one subscription transaction on a stable per-account day (derived from account index). This guarantees exactly one occurrence per month with no duplication risk.

### 3. Log-normal distribution via Box-Muller transform

The seeded PRNG (`mulberry32`) only produces uniform floats. A Box-Muller transform converts two uniform samples into a normal variate, which is then exponentiated to get log-normal. Parameters `μ` and `σ` are derived per-category from the existing `minAmount`/`maxAmount` range so the bulk of values still fall within the original bounds.

### 4. Churn implemented as a per-user cutoff month

At startup, each user is assigned a `churnMonth` drawn from a uniform distribution over the full date range. Users with `churnAfterFraction` chance (configurable, default `0`) get a cutoff; beyond it their batches are skipped. Default `0` means no churn — fully backwards compatible.

### 5. Env var config overrides in `index.ts`

`index.ts` reads `NUM_USERS`, `ACCOUNTS_PER_USER`, `TX_PER_ACCOUNT`, `SEED`, and `CHURN_RATE` from `process.env`, parses them as integers/floats, and merges with `DEFAULT_CONFIG`. Invalid values log a warning and fall back to the default. Keeps `generator.ts` pure and untouched by I/O concerns.

### 6. Default volume stays at 85 for tests; `FULL_SCALE` preset documented

Changing the default to 850 would make every dev run slow. Instead, keep `DEFAULT_CONFIG.transactionsPerAccountPerMonth = 85` and document a full-scale invocation in the README: `TX_PER_ACCOUNT=850 node pipeline/dist/index.js`.
