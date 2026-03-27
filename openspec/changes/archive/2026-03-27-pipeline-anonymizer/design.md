## Context

`pipeline/src/index.ts` already has a `// TODO DEV-40` comment where anonymization should be called. The generator yields `GeneratorBatch` objects containing `Transaction[]`. The anonymizer slots in between the generator and the (future) Parquet writer.

## Goals / Non-Goals

**Goals:**
- `anonymize(raw: Transaction): AnonymizedTransaction` — pure, synchronous, no I/O
- SHA-256 hex digest via Node built-in `crypto` — deterministic, no external deps
- `AnonymizedTransaction` uses `Omit<Transaction, 'counterparty'>` — no schema duplication

**Non-Goals:**
- Batch-level function (single record is cleaner and composable via `.map()`)
- Salting the hash (determinism across partitions is a hard requirement)
- Any anonymization strategy beyond what the spec requires

## Decisions

### 1. `Omit<Transaction, 'counterparty'>` over a new interface
Avoids duplicating 9 field definitions. TypeScript will enforce that `AnonymizedTransaction` is structurally compatible with `Transaction` minus `counterparty`, and any future field added to `Transaction` is automatically present in `AnonymizedTransaction`.

**Alternative:** Explicit `AnonymizedTransaction` interface — more verbose, risks drift.

### 2. SHA-256 hex, not base64
Hex is URL-safe, consistent length (64 chars), and easier to compare in SQL queries. Base64 would save ~15% space but adds encoding complexity.

### 3. Synchronous `createHash` (not `subtle.digest`)
Node's `crypto.createHash` is synchronous and has no overhead for short strings. `subtle.digest` returns a Promise — unnecessary async complexity for a pure transform.

## Risks / Trade-offs

- **Hash collisions** → SHA-256 collision probability is negligible for this data volume (~20M rows).
- **Irreversibility** → Intentional. Once hashed, `user_id`/`account_id`/`iban` cannot be recovered. Raw data is never written to disk or S3.
