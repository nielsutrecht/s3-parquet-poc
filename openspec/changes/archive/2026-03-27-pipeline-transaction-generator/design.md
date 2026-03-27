## Context

`pipeline/src/index.ts` is a placeholder stub. This change wires the first stage of the pipeline. The anonymizer (DEV-40) and Parquet writer (DEV-41) don't exist yet, so the generator's output interface must be defined here and consumed by stubs.

The generator must produce ~20M rows across 24 monthly partitions without holding all records in memory simultaneously.

## Goals / Non-Goals

**Goals:**
- `generateTransactions(config)` returns an async generator yielding one `{ year, month, transactions }` batch per iteration
- Same `config` + `seed` always produces identical output
- 3 user archetypes with meaningfully different income and spend patterns
- `account_id` stable: same account IDs appear every month for the same user
- No external npm dependencies

**Non-Goals:**
- Streaming row-by-row (batch-per-month is sufficient granularity)
- Realistic calendar logic (weekends, holidays)
- Multi-currency (EUR throughout)
- Balance tracking across months

## Decisions

### 1. mulberry32 as the seeded PRNG

mulberry32 is a 32-bit PRNG that fits in ~5 lines of TypeScript, has good statistical properties for this use case, and requires no dependencies. Seeded from a single integer, it produces a fully deterministic sequence.

**Alternative:** `seedrandom` npm package — adds a dependency for something trivially implementable inline.

### 2. Accounts pre-generated at startup, keyed by userId

At generator startup, `numUsers × accountsPerUser` accounts are generated once using the seeded RNG. Each account gets a stable `account_id` (e.g. `acc_0042`). The same array is reused on every monthly iteration, ensuring cross-partition join stability.

**Alternative:** Derive account IDs from a hash of userId+index — deterministic without pre-generation, but less flexible if the config changes.

### 3. User archetypes assigned round-robin

Users are assigned archetypes in order: `[low, mid, high, low, mid, high, ...]`. This gives an even 1:1:1 split regardless of user count. Each archetype defines:
- Salary range (credit, monthly)
- Spend categories with weights and amount ranges
- Number of transactions per month (range)

### 4. Transactions per account, not per user

The `transactionsPerAccountPerMonth` config applies per account. A user with 10 accounts generates 10× more transactions than a user with 1 account, which is realistic (more accounts = more activity surfaces).

### 5. Descriptions are category-keyed templates with minor variation

Each category has 3–5 description templates (e.g. `"Grocery store"`, `"Supermarket"`, `"Local market"` for groceries). The PRNG picks one per transaction. This gives realistic variety without complex NLP.

### 6. IBAN format: `DE` + 20 random digits

Synthetic, structurally plausible, not checksum-valid. Sufficient for hashing in the anonymizer.

## Risks / Trade-offs

- **Memory: one month ≈ 850K transactions × ~500 bytes/object ≈ 425 MB** → Mitigation: caller (Parquet writer) must process and discard each batch before requesting the next. The generator itself holds only the current batch.
- **mulberry32 period is 2³²** → ~4B values before cycling. 20M rows × ~5 RNG calls/row = 100M calls — well within range.
- **Round-robin archetype assignment is predictable** → Fine for synthetic data; not a concern for this PoC.
