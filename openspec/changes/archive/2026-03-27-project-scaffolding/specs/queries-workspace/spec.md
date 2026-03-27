## ADDED Requirements

### Requirement: queries workspace package.json
`queries/package.json` SHALL declare `name: "@s3-parquet-poc/queries"`, set `"type": "module"`, and include `build` and `typecheck` scripts. It SHALL have no production dependencies at scaffold time.

#### Scenario: queries workspace is recognized by npm
- **WHEN** `npm run build --workspace=queries` is run from root
- **THEN** the queries build script executes without workspace resolution errors

### Requirement: queries tsconfig extends root
`queries/tsconfig.json` SHALL extend `../tsconfig.json`, set `rootDir: "src"`, `outDir: "dist"`.

#### Scenario: queries compiles independently
- **WHEN** `tsc -p queries/tsconfig.json` is run
- **THEN** TypeScript compiles without errors and emits files to `queries/dist/`

### Requirement: queries directory structure
The `queries/` workspace SHALL contain sub-directories:
- `queries/athena/` — for `.sql` sample query files (at least one placeholder `.sql` file)
- `queries/src/` — for the DuckDB TypeScript script (placeholder `duckdb.ts`)

#### Scenario: Athena queries directory exists
- **WHEN** the scaffold is applied
- **THEN** `queries/athena/` exists and contains at least one `.sql` file

#### Scenario: DuckDB script placeholder exists
- **WHEN** the scaffold is applied
- **THEN** `queries/src/duckdb.ts` exists as a valid TypeScript file

### Requirement: queries build produces output
`queries/src/duckdb.ts` SHALL be a valid TypeScript file that compiles to `queries/dist/duckdb.js`.

#### Scenario: queries build produces output
- **WHEN** `npm run build -w queries` is run
- **THEN** `queries/dist/duckdb.js` is created
