## 1. Types

- [x] 1.1 Remove `accountsPerUser` field from `GeneratorConfig` in `pipeline/src/types.ts`

## 2. Generator — distribution table and helper

- [x] 2.1 Add `ACCOUNTS_DISTRIBUTION` weighted table (keyed by archetype name) to `pipeline/src/generator.ts`
- [x] 2.2 Add `drawAccountCount(archetype, rng)` helper that draws from the table using `rng.nextFloat()`

## 3. Generator — user pre-generation loop

- [x] 3.1 Introduce a `globalAccountIndex` counter (starts at 0, incremented per account)
- [x] 3.2 Replace `for (let a = 0; a < accountsPerUser; a++)` with a draw from `drawAccountCount`
- [x] 3.3 Replace `u * accountsPerUser + a` with `globalAccountIndex` for `accountId` and `subscriptionDay`
- [x] 3.4 Remove `accountsPerUser` from destructured config in `generateTransactions`
- [x] 3.5 Remove `accountsPerUser` from `DEFAULT_CONFIG`

## 4. Entry point

- [x] 4.1 Remove `ACCOUNTS_PER_USER` env var parsing from `pipeline/src/index.ts`
- [x] 4.2 Remove `accountsPerUser` from the config object in `main()`
- [x] 4.3 Update the startup log line to remove the fixed account count reference

## 5. Verification

- [x] 5.1 Run `npm run typecheck` — no errors
- [x] 5.2 Run `npm run lint` — no new errors (3 pre-existing errors in anonymizer.ts and generator.ts unrelated to this change)
- [x] 5.3 Run `npm run build` — compiles cleanly
- [x] 5.4 Run the pipeline with default config and confirm low/mid/high users have varying account counts in the output
