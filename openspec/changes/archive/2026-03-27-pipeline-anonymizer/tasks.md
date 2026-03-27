## 1. Types

- [x] 1.1 Add `export type AnonymizedTransaction = Omit<Transaction, 'counterparty'>` to `pipeline/src/types.ts`

## 2. Anonymizer

- [x] 2.1 Create `pipeline/src/anonymizer.ts` — implement `anonymize(raw: Transaction): AnonymizedTransaction` using `crypto.createHash('sha256')` hex digest for `user_id`, `account_id`, and `iban`

## 3. Wire up

- [x] 3.1 Update `pipeline/src/index.ts` — replace the DEV-40 TODO stub with `batch.transactions.map(anonymize)` and log anonymized count

## 4. Verify

- [x] 4.1 Run `npm run build --workspace=pipeline` — compiles with no errors
- [x] 4.2 Run `npm run typecheck --workspace=pipeline` — strict mode passes
- [x] 4.3 Run `node pipeline/dist/index.js` — confirm anonymized transactions logged per batch
- [x] 4.4 Spot-check: confirm `user_id` in output is a 64-char hex string, `counterparty` is absent
