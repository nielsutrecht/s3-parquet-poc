## 1. Types

- [x] 1.1 Add `churnRate?: number` to `GeneratorConfig` in `pipeline/src/types.ts`

## 2. Generator — recurring transactions

- [x] 2.1 Remove `rent` and `subscriptions` from weighted category pools in all three archetypes
- [x] 2.2 Add recurring transaction logic: one rent on day 1 per account per month
- [x] 2.3 Add recurring transaction logic: one subscription on a stable per-account day per month

## 3. Generator — log-normal amounts

- [x] 3.1 Add Box-Muller helper to `prng.ts` — `nextLogNormal(mu, sigma): number`
- [x] 3.2 Replace uniform amount sampling with log-normal in spend transaction generation
- [x] 3.3 Keep salary amounts as uniform random (unchanged)

## 4. Generator — seasonal multipliers

- [x] 4.1 Add `SEASONAL_MULTIPLIERS` lookup table (month 1–12 → multiplier)
- [x] 4.2 Apply multiplier to `txCount` per account per month

## 5. Generator — churn

- [x] 5.1 At startup, assign a random cutoff month to each user when `churnRate > 0`
- [x] 5.2 Skip transaction generation for churned users in batches after their cutoff month

## 6. Config — env var overrides

- [x] 6.1 Parse `NUM_USERS`, `ACCOUNTS_PER_USER`, `TX_PER_ACCOUNT`, `SEED`, `CHURN_RATE` from `process.env` in `index.ts`
- [x] 6.2 Warn to stderr and fall back to default for invalid values
- [x] 6.3 Log the resolved config (including source: default vs env) at startup

## 7. README

- [x] 7.1 Update Pipeline section with full-scale invocation example (`TX_PER_ACCOUNT=850 ...`)
- [x] 7.2 Document all supported env vars

## 8. Verify

- [x] 8.1 Run with default config — pipeline completes, ~2M rows
- [ ] 8.2 Run with `TX_PER_ACCOUNT=850` — pipeline completes, ~20M rows
- [x] 8.3 Confirm December batch has more transactions than January batch
- [x] 8.4 Confirm each account has exactly one rent transaction per month (day 01)
- [x] 8.5 Run with `CHURN_RATE=0.5` — confirm ~50% of users absent in final months
