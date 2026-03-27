## Context

Greenfield TypeScript project with three distinct workspaces sharing tooling:
- `infra/` — Pulumi TypeScript program (AWS S3, Glue, Athena)
- `pipeline/` — Node.js script: generate → anonymize → write Parquet to S3
- `queries/` — Athena `.sql` files and a DuckDB query script

Node v25.6.1 is available locally; npm workspaces are used (pnpm not installed).

## Goals / Non-Goals

**Goals:**
- Single `npm install` at root installs all workspace dependencies
- Shared TypeScript compiler and ESLint config with zero duplication
- Each workspace can be compiled and type-checked independently
- `npm run build/lint/typecheck` works from the root (runs all workspaces)
- Pulumi's `pulumi up` works from `infra/` without extra steps

**Non-Goals:**
- Setting up CI/CD pipelines
- Installing Pulumi SDK or AWS SDK dependencies (belongs in workspace-specific issues)
- Configuring Pulumi backend/stack (belongs in infra issue)
- Jest or any test framework setup

## Decisions

### 1. npm workspaces over pnpm/Turborepo
npm workspaces are sufficient for three packages and zero cross-workspace imports. No build orchestration tool needed — workspaces are independent. Adding Turborepo would be premature complexity.

**Alternatives:** pnpm (not installed), Turborepo (overkill for 3 leaf-node workspaces with no interdependencies).

### 2. Single root `tsconfig.json` with per-workspace extends
Root sets `strict`, `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`. Each workspace extends root and sets its own `rootDir`/`outDir`. Pulumi requires `moduleResolution: node16` or `NodeNext` for its ESM-compatible SDK.

**Alternative:** Fully standalone tsconfigs per workspace — causes drift in strict settings over time.

### 3. ESLint flat config (`eslint.config.mjs`)
The legacy `.eslintrc` format is deprecated as of ESLint 9. Flat config is the default going forward and simpler to extend per-workspace via spreading.

**Alternative:** Legacy `.eslintrc.json` — works but deprecated.

### 4. Node 22 LTS in `.nvmrc`
Node 22 is the current LTS line (Active LTS until 2025-10-27, Maintenance until 2027-04-30). Pulumi Node.js SDK requires Node ≥ 18. Node 25.x (installed locally) is odd-numbered/unstable — not suitable for pinning.

**Alternative:** Pin to installed 25.x — non-LTS, no long-term support.

### 5. `queries/` as a workspace even though it has SQL files
`queries/` needs a `package.json` anyway for the DuckDB TypeScript script. Making it a workspace keeps tooling consistent and allows `npm run build -w queries` from root.

## Risks / Trade-offs

- **Pulumi tsconfig quirk** → Pulumi's own scaffolding generates a tsconfig that doesn't extend anything. Our extending approach should work but needs verification with `pulumi preview`. Mitigation: pin `skipLibCheck: true` in infra tsconfig to handle Pulumi's own type declarations.
- **npm workspaces hoisting** → Packages hoisted to root `node_modules` may shadow workspace-local versions. Mitigation: keep Pulumi SDK in `infra/` only (not root) so it doesn't get hoisted unexpectedly.
- **ESLint flat config learning curve** → Flat config syntax differs from `.eslintrc`. Mitigation: use minimal config and document the pattern in a comment.
