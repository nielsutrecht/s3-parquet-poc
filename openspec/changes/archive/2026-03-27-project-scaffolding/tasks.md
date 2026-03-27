## 1. Root configuration

- [x] 1.1 Create `.nvmrc` with content `22`
- [x] 1.2 Create root `package.json` with npm workspaces (`infra`, `pipeline`, `queries`), shared devDependencies (`typescript`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`), and root `build`, `typecheck`, `lint` scripts delegating to all workspaces
- [x] 1.3 Create root `tsconfig.json` with `strict: true`, `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`
- [x] 1.4 Create `eslint.config.mjs` with ESLint flat config using `@typescript-eslint/recommended`, ignoring `**/dist/**` and `**/node_modules/**`
- [x] 1.5 Create `.gitignore` covering `node_modules/`, `dist/`, `*.js`/`*.d.ts` in `src/`, `.pulumi/`, `.DS_Store`, `.env`

## 2. infra workspace

- [x] 2.1 Create `infra/package.json` with name `@s3-parquet-poc/infra`, `main: "dist/index.js"`, and `build`/`typecheck` scripts
- [x] 2.2 Create `infra/tsconfig.json` extending `../tsconfig.json` with `rootDir: "src"`, `outDir: "dist"`, `skipLibCheck: true`
- [x] 2.3 Create `infra/src/index.ts` as a placeholder Pulumi program (`export {}` with a comment)

## 3. pipeline workspace

- [x] 3.1 Create `pipeline/package.json` with name `@s3-parquet-poc/pipeline`, `type: "module"`, and `build`/`typecheck` scripts
- [x] 3.2 Create `pipeline/tsconfig.json` extending `../tsconfig.json` with `rootDir: "src"`, `outDir: "dist"`
- [x] 3.3 Create `pipeline/src/index.ts` as a placeholder `main()` stub

## 4. queries workspace

- [x] 4.1 Create `queries/package.json` with name `@s3-parquet-poc/queries`, `type: "module"`, and `build`/`typecheck` scripts
- [x] 4.2 Create `queries/tsconfig.json` extending `../tsconfig.json` with `rootDir: "src"`, `outDir: "dist"`
- [x] 4.3 Create `queries/src/duckdb.ts` as a placeholder script stub
- [x] 4.4 Create `queries/athena/` directory with a placeholder `sample.sql` file

## 5. Verify

- [x] 5.1 Run `npm install` from root — confirm zero errors
- [x] 5.2 Run `npm run build` from root — confirm all three workspaces compile to `dist/`
- [x] 5.3 Run `npm run typecheck` from root — confirm no TypeScript errors
- [x] 5.4 Run `npm run lint` from root — confirm ESLint exits 0
