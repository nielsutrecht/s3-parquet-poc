## Context

The pipeline pre-generates a stable user/account structure at startup. Currently each user gets exactly `accountsPerUser` accounts (default 10), regardless of their archetype. This produces a uniform account distribution that doesn't reflect real-world patterns where wealthier users tend to hold more bank accounts.

The seeded PRNG (`mulberry32`) is already used for all randomisation; the challenge is replacing a single integer config field with a per-user probabilistic draw while keeping IDs stable and deterministic.

## Goals / Non-Goals

**Goals:**
- Replace fixed `accountsPerUser` with a per-archetype weighted distribution
- Keep account IDs and subscription days deterministic given the same seed
- Remove `ACCOUNTS_PER_USER` env var (no longer meaningful)
- Keep changes contained to `types.ts`, `generator.ts`, and `index.ts`

**Non-Goals:**
- Changing the archetype definitions themselves
- Modifying the transaction generation logic per account
- Updating the Parquet schema or Glue table

## Decisions

### Distribution table vs. formula

**Decision**: Use an explicit weighted lookup table (`ACCOUNTS_DISTRIBUTION`) rather than a parametric formula (e.g., Poisson or geometric).

**Rationale**: The table makes the distribution immediately readable and easy to tune. Formulae (e.g., `max(1, floor(-log(rng) * mean))`) produce harder-to-verify tails and require per-archetype parameter fitting. Since we have only 3 archetypes and a small range (1–8), a table is simpler.

**Alternative considered**: Geometric distribution with archetype-specific means (1.75 / 3.5 / 5.5). Rejected because the tail behaviour is less controlled and harder to reason about.

### Global account counter for stable IDs

**Decision**: Replace `u * accountsPerUser + a` with a global counter incremented once per account across all users.

**Rationale**: The old formula relied on `accountsPerUser` being fixed. With variable counts, IDs would collide or gap unpredictably if computed per-user. A single monotonic counter produces unique, zero-padded IDs (`acc_0000`, `acc_0001`, ...) that are stable for a given seed as long as users are processed in the same order.

**Alternative considered**: Composite ID like `acc_U{u}_A{a}`. Rejected because it changes the existing `acc_NNNN` format that the anonymizer and specs depend on.

### Removal of `accountsPerUser` config field

**Decision**: Remove the field entirely rather than keeping it as a fallback or cap.

**Rationale**: Keeping a dead field invites confusion. The distribution table fully replaces it. If a caller needs a fixed count they can set all distribution weights to a single bucket.

## Risks / Trade-offs

- **Seed sensitivity**: Any seed-dependent test that expects a specific transaction count will need updating, since the total account count per run will now vary by seed. → Mitigation: Tests should assert ranges, not exact counts.
- **Mean account count shift**: Default config had 10 accounts/user; the new distribution averages ~1.75/3.5/5.5 depending on archetype (mean across 3 archetypes ≈ 3.6). Total transaction volume drops significantly at default settings. → Mitigation: This is intentional — the prior default was unrealistically high.
- **ID space**: With 100 users × max 8 accounts = 800 accounts max, the `acc_NNNN` format (4 digits = up to 9999) is sufficient.

## Migration Plan

No data migration needed — this is a synthetic data generator. Running the pipeline after the change produces new Parquet files with different account distributions. Old S3 data remains unchanged unless re-uploaded.
