## ADDED Requirements

### Requirement: Root package.json with npm workspaces
The root `package.json` SHALL define npm workspaces pointing to `infra/`, `pipeline/`, and `queries/`. It SHALL include root-level `devDependencies` for shared tooling (TypeScript, ESLint, @typescript-eslint) and `scripts` for `build`, `typecheck`, and `lint` that delegate to all workspaces via `--workspaces`.

#### Scenario: Single install installs all workspace dependencies
- **WHEN** a developer runs `npm install` from the project root
- **THEN** dependencies for all three workspaces are installed under root `node_modules` or their workspace-local `node_modules`

#### Scenario: Root build delegates to all workspaces
- **WHEN** a developer runs `npm run build` from the project root
- **THEN** the TypeScript compiler runs for `infra/`, `pipeline/`, and `queries/` workspaces in sequence

#### Scenario: Root lint delegates to all workspaces
- **WHEN** a developer runs `npm run lint` from the project root
- **THEN** ESLint runs across all workspace source files and exits 0 with no errors on a clean scaffold

### Requirement: Root tsconfig.json in strict mode
The root `tsconfig.json` SHALL enable `strict: true`, target `ES2022`, use `module: NodeNext` and `moduleResolution: NodeNext`. It SHALL NOT set `rootDir` or `outDir` (those are per-workspace). It SHALL be referenced by all workspace tsconfigs via `extends`.

#### Scenario: Strict mode is inherited by workspaces
- **WHEN** a workspace tsconfig extends the root and compiles
- **THEN** TypeScript enforces strict null checks, no implicit any, and all other strict flags

### Requirement: ESLint flat config
The root `eslint.config.mjs` SHALL use ESLint flat config format with `@typescript-eslint/recommended` rules applied to all `**/*.ts` files. It SHALL ignore `**/dist/**` and `**/node_modules/**`.

#### Scenario: Lint passes on scaffold with no source errors
- **WHEN** `npm run lint` is run immediately after scaffolding
- **THEN** ESLint exits 0 and reports no errors or warnings

### Requirement: Node version pin
A `.nvmrc` file SHALL exist at the project root containing `22` to pin the Node.js LTS version.

#### Scenario: nvm picks up the correct version
- **WHEN** a developer runs `nvm use` in the project root
- **THEN** nvm switches to Node 22.x

### Requirement: .gitignore covers standard artifacts
The `.gitignore` SHALL exclude: `node_modules/`, `dist/`, `*.js` and `*.d.ts` build output inside `src/`, Pulumi state files (`.pulumi/`), and common OS/editor artifacts (`.DS_Store`, `.env`).

#### Scenario: Build output is not tracked
- **WHEN** a workspace is compiled and `git status` is run
- **THEN** no compiled `.js` or `.d.ts` files appear as untracked
