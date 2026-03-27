## ADDED Requirements

### Requirement: infra workspace package.json
`infra/package.json` SHALL declare `name: "@s3-parquet-poc/infra"`, set `"main": "index.js"` (required by Pulumi), and include a `build` script running `tsc -p tsconfig.json`. It SHALL list `@pulumi/pulumi` and `@pulumi/aws` as `dependencies` (not devDependencies, as Pulumi requires them at runtime).

#### Scenario: Pulumi can resolve the entry point
- **WHEN** `pulumi preview` is run from `infra/`
- **THEN** Pulumi resolves `index.js` as the program entry point without errors

### Requirement: infra tsconfig extends root
`infra/tsconfig.json` SHALL extend `../tsconfig.json`, set `rootDir: "src"`, `outDir: "dist"`, and include `skipLibCheck: true` to handle Pulumi's type declarations.

#### Scenario: infra compiles independently
- **WHEN** `tsc -p infra/tsconfig.json` is run from the project root
- **THEN** TypeScript compiles without errors and emits files to `infra/dist/`

### Requirement: infra placeholder entry point
`infra/src/index.ts` SHALL exist as a valid TypeScript file with a minimal Pulumi export (e.g., an empty `export {}` or a comment indicating future stack resources).

#### Scenario: infra build produces output
- **WHEN** `npm run build -w infra` is run
- **THEN** `infra/dist/index.js` is created
