## Why

The s3-parquet-poc repo is empty apart from a PRD. Before any feature work can start, the project needs a runnable TypeScript monorepo skeleton so that `infra/`, `pipeline/`, and `queries/` workspaces can be developed independently with shared tooling.

## What Changes

- Add root `package.json` with npm workspaces pointing at `infra/`, `pipeline/`, `queries/`
- Add root `tsconfig.json` (strict mode) and per-workspace `tsconfig.json` files extending it
- Add `.nvmrc` pinning Node 22 LTS
- Add `.gitignore` covering Node, TypeScript build output, and Pulumi state
- Add ESLint flat config (`eslint.config.mjs`) with `@typescript-eslint/recommended`
- Add placeholder `src/index.ts` in each workspace so the build has something to compile
- Wire `build`, `lint`, and `typecheck` npm scripts at root and per-workspace level

## Capabilities

### New Capabilities

- `repo-scaffold`: Root monorepo configuration — workspaces, shared TypeScript and ESLint config, Node version pin, and gitignore
- `infra-workspace`: Pulumi TypeScript workspace skeleton under `infra/`
- `pipeline-workspace`: Data pipeline TypeScript workspace skeleton under `pipeline/`
- `queries-workspace`: Athena SQL + DuckDB query script workspace skeleton under `queries/`

### Modified Capabilities

<!-- none — greenfield project -->

## Impact

- No existing code is modified (repo is empty)
- Introduces dev dependencies: `typescript`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- Pulumi SDK (`@pulumi/pulumi`, `@pulumi/aws`) will be added to `infra/` as workspace-local deps
- Sets the Node version contract for all contributors and CI
