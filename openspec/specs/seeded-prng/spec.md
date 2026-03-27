## ADDED Requirements

### Requirement: Seeded PRNG factory
`pipeline/src/prng.ts` SHALL export a `createPrng(seed: number)` function that returns a stateful PRNG object with at minimum:
- `nextFloat(): number` — returns a float in [0, 1)
- `nextInt(min: number, max: number): number` — returns an integer in [min, max] inclusive
- `pick<T>(arr: T[]): T` — returns a random element from a non-empty array

The PRNG SHALL be deterministic: the same seed always produces the same sequence of values.

#### Scenario: Same seed produces identical sequence
- **WHEN** two PRNG instances are created with the same seed and each calls `nextFloat()` ten times
- **THEN** both sequences are identical

#### Scenario: Different seeds produce different sequences
- **WHEN** two PRNG instances are created with different seeds and each calls `nextFloat()` once
- **THEN** the values differ (with overwhelming probability)

#### Scenario: nextInt stays within bounds
- **WHEN** `nextInt(1, 6)` is called 1000 times
- **THEN** every result is an integer between 1 and 6 inclusive

#### Scenario: pick returns an array element
- **WHEN** `pick(["a", "b", "c"])` is called
- **THEN** the return value is one of `"a"`, `"b"`, or `"c"`
