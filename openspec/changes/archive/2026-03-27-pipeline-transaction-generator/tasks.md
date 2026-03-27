## 1. Types

- [x] 1.1 Create `pipeline/src/types.ts` with `Transaction`, `GeneratorConfig`, and `UserArchetype` interfaces

## 2. Seeded PRNG

- [x] 2.1 Create `pipeline/src/prng.ts` with `createPrng(seed)` implementing mulberry32 — expose `nextFloat()`, `nextInt(min, max)`, `pick(arr)`

## 3. Archetype definitions

- [x] 3.1 Define the three archetype configs (low/mid/high) in `pipeline/src/generator.ts` — salary ranges, category weights + amount ranges, tx count ranges

## 4. Generator core

- [x] 4.1 Implement account pre-generation: for each user, generate `accountsPerUser` stable `acc_NNNN` IDs using the seeded PRNG at startup
- [x] 4.2 Implement `generateTransactions(config)` async generator — iterate months from start to end, yield `{ year, month, transactions }`
- [x] 4.3 For each month/user/account: generate the salary credit transaction (one per user per month)
- [x] 4.4 For each month/user/account: generate spend transactions using archetype category weights and amount ranges
- [x] 4.5 Populate all 11 `Transaction` fields: UUIDs via `crypto.randomUUID()`, date within the month, IBAN as `DE` + 20 digits, counterparty as a synthetic name

## 5. Wire entry point

- [x] 5.1 Update `pipeline/src/index.ts` to call `generateTransactions` and iterate batches (log batch summary for now; anonymizer/writer stubs come in DEV-40/41)

## 6. Verify

- [x] 6.1 Run `npm run build --workspace=pipeline` — compiles with no errors
- [x] 6.2 Run `npm run typecheck --workspace=pipeline` — strict mode passes
- [x] 6.3 Run the pipeline (`node pipeline/dist/index.js`) and confirm it logs 24 batches with expected transaction counts
- [x] 6.4 Confirm same seed produces identical first-batch output on two runs (spot-check determinism)
