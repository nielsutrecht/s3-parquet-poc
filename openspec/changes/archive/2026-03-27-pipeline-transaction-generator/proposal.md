## Why

The pipeline needs a source of synthetic transaction data before the anonymizer and Parquet writer can run. This change implements the generator: the first stage in the generate → anonymize → write pipeline.

## What Changes

- Replace the `pipeline/src/index.ts` placeholder with a working entry point that wires generator → anonymizer → writer
- Add `pipeline/src/generator.ts` — async batch generator yielding one month of raw transactions at a time
- Add `pipeline/src/types.ts` — shared `Transaction` and `GeneratorConfig` TypeScript types
- Add `pipeline/src/prng.ts` — seeded PRNG (mulberry32) for deterministic, reproducible output
- Default config: 100 users × 10 accounts × ~850 transactions/month × 24 months ≈ 20M rows

## Capabilities

### New Capabilities

- `transaction-types`: Shared TypeScript types for `Transaction`, `GeneratorConfig`, and `UserArchetype`
- `seeded-prng`: Lightweight seeded pseudo-random number generator (no external deps)
- `transaction-generator`: Batch async generator — yields `{ year, month, transactions }` per partition with 3 user archetypes (low/mid/high income)

### Modified Capabilities

- `pipeline-workspace`: Entry point changes from placeholder to a wired pipeline stub (no spec-level requirement change)

## Impact

- Modifies `pipeline/src/index.ts`
- Adds `pipeline/src/types.ts`, `pipeline/src/generator.ts`, `pipeline/src/prng.ts`
- No new npm dependencies
- Output consumed by anonymizer (DEV-40) and Parquet writer (DEV-41) — those modules are stubbed for now
