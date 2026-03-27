## Why

The generator produces raw transactions containing PII (`counterparty`, and identifiers `user_id`, `account_id`, `iban`). Before writing to S3, these must be anonymized so the stored data cannot be traced back to individuals. This is the second stage of the generate → anonymize → write pipeline.

## What Changes

- Add `AnonymizedTransaction` type to `pipeline/src/types.ts` (`Omit<Transaction, 'counterparty'>`)
- Add `pipeline/src/anonymizer.ts` — exports `anonymize(raw: Transaction): AnonymizedTransaction`
- Update `pipeline/src/index.ts` to call `anonymize` on each batch (replaces the DEV-40 TODO stub)

## Capabilities

### New Capabilities

- `transaction-anonymizer`: Pure function that removes `counterparty` and SHA-256 hashes `user_id`, `account_id`, and `iban`

### Modified Capabilities

- `transaction-types`: Add `AnonymizedTransaction` type (new export, no existing requirements change)

## Impact

- Modifies `pipeline/src/types.ts` (additive — new type only)
- Modifies `pipeline/src/index.ts` (replaces TODO stub)
- Adds `pipeline/src/anonymizer.ts`
- No new npm dependencies
