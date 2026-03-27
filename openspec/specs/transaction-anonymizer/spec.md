## ADDED Requirements

### Requirement: AnonymizedTransaction type
`pipeline/src/types.ts` SHALL export `AnonymizedTransaction` as `Omit<Transaction, 'counterparty'>`. This type represents a transaction safe for storage, with PII fields either removed or hashed.

#### Scenario: AnonymizedTransaction has no counterparty field
- **WHEN** TypeScript compiles code that accesses `.counterparty` on an `AnonymizedTransaction`
- **THEN** the compiler reports a type error

#### Scenario: AnonymizedTransaction is assignable from Transaction minus counterparty
- **WHEN** an object with all Transaction fields except counterparty is assigned to `AnonymizedTransaction`
- **THEN** TypeScript accepts the assignment without error

### Requirement: anonymize pure function
`pipeline/src/anonymizer.ts` SHALL export `anonymize(raw: Transaction): AnonymizedTransaction` that:
- Removes the `counterparty` field
- Replaces `user_id`, `account_id`, and `iban` each with their SHA-256 hex digest
- Passes all other fields (`transaction_id`, `date`, `amount`, `currency`, `description`, `category`) through unchanged

#### Scenario: counterparty is absent from output
- **WHEN** `anonymize(tx)` is called
- **THEN** the returned object has no `counterparty` property

#### Scenario: PII fields are hashed
- **WHEN** `anonymize(tx)` is called with `user_id: "user_0001"`
- **THEN** the returned `user_id` is the 64-character SHA-256 hex digest of `"user_0001"`

#### Scenario: Non-PII fields are unchanged
- **WHEN** `anonymize(tx)` is called
- **THEN** `transaction_id`, `date`, `amount`, `currency`, `description`, and `category` are identical to the input

#### Scenario: Hashing is deterministic
- **WHEN** `anonymize` is called twice with the same input
- **THEN** the output `user_id`, `account_id`, and `iban` are identical both times

#### Scenario: Same identifier hashes identically across records
- **WHEN** two transactions share the same `user_id` value
- **THEN** both anonymized records have the same hashed `user_id`, preserving join capability
