## ADDED Requirements

### Requirement: Transaction type
The codebase SHALL define a `Transaction` TypeScript interface representing a single raw (pre-anonymization) transaction with fields: `transaction_id`, `user_id`, `account_id`, `date`, `amount`, `currency`, `description`, `category`, `counterparty`, `iban`.

#### Scenario: Transaction type is importable by other modules
- **WHEN** another module imports `Transaction` from `pipeline/src/types.ts`
- **THEN** TypeScript resolves the type without errors under strict mode

### Requirement: GeneratorConfig type
The codebase SHALL define a `GeneratorConfig` TypeScript interface with fields: `numUsers`, `accountsPerUser`, `transactionsPerAccountPerMonth`, `seed`, `startYear`, `startMonth`, `endYear`, `endMonth`.

#### Scenario: Default config produces expected row count
- **WHEN** `GeneratorConfig` is instantiated with `numUsers: 100`, `accountsPerUser: 10`, `transactionsPerAccountPerMonth: 85`
- **THEN** total transactions = 100 × 10 × 85 × 24 = 2,040,000 (per the type contract; actual volume uses higher default)

### Requirement: UserArchetype type
The codebase SHALL define a `UserArchetype` type or interface describing an income tier's spend behaviour: salary range, category weights, amount ranges per category, and transaction count range per account per month.

#### Scenario: Three archetypes are defined
- **WHEN** the generator module is imported
- **THEN** three archetype definitions exist for `low`, `mid`, and `high` income tiers
