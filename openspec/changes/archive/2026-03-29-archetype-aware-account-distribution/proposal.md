## Why

Every user currently has exactly `accountsPerUser` (default: 10) accounts regardless of income level, producing unrealistically uniform data. Real-world account ownership varies by wealth: low-income users typically hold 1–2 accounts, mid-income 2–5, high-income 3–8.

## What Changes

- Remove `accountsPerUser` field from `GeneratorConfig` and `DEFAULT_CONFIG`
- Add an archetype-keyed weighted distribution table (`ACCOUNTS_DISTRIBUTION`) in the generator
- Draw account count per user at startup via `drawAccountCount(archetype, rng)` using the seeded PRNG
- Replace `u * accountsPerUser + a` account ID indexing with a global counter to keep IDs stable
- Remove `ACCOUNTS_PER_USER` env var support from `index.ts`
- Update the startup log line to omit the fixed account count

## Capabilities

### New Capabilities

- `account-distribution`: Archetype-aware weighted distribution of account counts per user (low: 1–4, mid: 2–6, high: 3–8)

### Modified Capabilities

- `transaction-generator`: `GeneratorConfig` loses `accountsPerUser`; account count is now drawn per-user from the distribution table rather than being a fixed config value

## Impact

- `pipeline/src/types.ts` — `GeneratorConfig` interface
- `pipeline/src/generator.ts` — user pre-generation loop, `DEFAULT_CONFIG`
- `pipeline/src/index.ts` — env var parsing, startup log
