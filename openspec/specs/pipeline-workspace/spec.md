## ADDED Requirements

### Requirement: pipeline workspace package.json
`pipeline/package.json` SHALL declare `name: "@s3-parquet-poc/pipeline"`, set `"type": "module"` for ESM compatibility, and include `build` and `typecheck` scripts. It SHALL have no production dependencies at scaffold time (those are added in the pipeline implementation issue).

#### Scenario: pipeline workspace is recognized by npm
- **WHEN** `npm run build --workspace=pipeline` is run from root
- **THEN** the pipeline build script executes without workspace resolution errors

### Requirement: pipeline tsconfig extends root
`pipeline/tsconfig.json` SHALL extend `../tsconfig.json`, set `rootDir: "src"`, `outDir: "dist"`.

#### Scenario: pipeline compiles independently
- **WHEN** `tsc -p pipeline/tsconfig.json` is run
- **THEN** TypeScript compiles without errors and emits files to `pipeline/dist/`

### Requirement: pipeline placeholder entry point
`pipeline/src/index.ts` SHALL exist as a valid TypeScript file (e.g., a `main()` stub with a `console.log` indicating the pipeline is not yet implemented).

#### Scenario: pipeline build produces output
- **WHEN** `npm run build -w pipeline` is run
- **THEN** `pipeline/dist/index.js` is created
