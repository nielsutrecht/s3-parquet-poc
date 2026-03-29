## ADDED Requirements

### Requirement: Archetype-aware account count distribution
The generator SHALL draw the number of accounts per user from a weighted distribution table keyed by archetype name. The distribution SHALL be:

| Archetype | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|-----------|---|---|---|---|---|---|---|---|
| low       | 50% | 30% | 15% | 5% | — | — | — | — |
| mid       | — | 20% | 35% | 25% | 15% | 5% | — | — |
| high      | — | — | 10% | 20% | 25% | 20% | 15% | 10% |

The draw SHALL use the seeded PRNG so results are deterministic for a given seed. `accountsPerUser` SHALL NOT exist as a config field or env var.

#### Scenario: Low income users have 1–4 accounts
- **WHEN** 100 low-income users are generated
- **THEN** every user has between 1 and 4 accounts (inclusive)

#### Scenario: High income users have 3–8 accounts
- **WHEN** 100 high-income users are generated
- **THEN** every user has between 3 and 8 accounts (inclusive)

#### Scenario: Distribution is deterministic
- **WHEN** `generateTransactions` is called twice with the same seed
- **THEN** each user has the same account count in both runs

#### Scenario: Low income users skew toward fewer accounts
- **WHEN** account counts are collected for 1000 low-income users
- **THEN** at least 70% have 1 or 2 accounts
