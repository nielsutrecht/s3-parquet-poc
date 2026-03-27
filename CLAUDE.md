# CLAUDE.md

## Project

TypeScript monorepo — synthetic bank transaction pipeline writing Parquet to S3, queryable via Athena and DuckDB.

## Workspaces

| Workspace | Purpose |
|---|---|
| `infra/` | Pulumi TypeScript — S3, Glue, Athena |
| `pipeline/` | Generate → anonymize → write Parquet to S3 |
| `queries/` | Athena SQL files + `duckdb.py` (Python, reads S3 directly) |

## Commands

```bash
npm install                          # install all deps
npm run build                        # compile all workspaces
npm run typecheck                    # type-check all workspaces
npm run lint                         # lint all workspaces
npm run build --workspace=pipeline   # compile one workspace
node pipeline/dist/index.js          # run the pipeline
```

Pulumi (always run from `infra/`, always prefix with `PULUMI_CONFIG_PASSPHRASE=""`):

```bash
cd infra
PULUMI_CONFIG_PASSPHRASE="" pulumi preview
PULUMI_CONFIG_PASSPHRASE="" pulumi up
PULUMI_CONFIG_PASSPHRASE="" pulumi destroy
```

## Tech decisions

- **TypeScript strict + NodeNext modules** — all workspaces extend root `tsconfig.json`
- **ESLint 9 flat config** (`eslint.config.mjs`) — `@typescript-eslint/recommended`
- **Node 22 LTS** — pinned in `.nvmrc`
- **npm workspaces** — no Turborepo; workspaces are independent leaf nodes
- **mulberry32 PRNG** — seeded, deterministic; no external dep
- **Pulumi local backend** — `file://~`; `Pulumi.*.yaml` is gitignored

## Pipeline design

```
generateTransactions(config)   →  AsyncGenerator<{ year, month, transactions }>
  └─ one batch per month, ~85K transactions (default config)
  └─ 3 user archetypes: low/mid/high income (round-robin)
  └─ accounts pre-generated at startup — stable across all months
```

Anonymizer: remove `counterparty`, SHA-256 hash `user_id` / `account_id` / `iban`.

Parquet writer: write each batch to `s3://<bucket>/transactions/year=YYYY/month=MM/` using `parquet-wasm` + `apache-arrow` (IPC stream as interchange), Snappy compression.

DuckDB (`queries/duckdb.py`): in-memory connection, `httpfs` + credential chain, glob pattern covers all 24 partitions. Run with `BUCKET_NAME=<bucket> python queries/duckdb.py`. Requires `pip install -r queries/requirements.txt`.

## Glue table

- Database: `s3_parquet_poc`, Table: `transactions`
- Partition projection on `year` (integer, 2024–2030) and `month` (injected)
- No `MSCK REPAIR TABLE` needed after uploads
- Athena workgroup: `s3-parquet-poc`, 1 GB scan limit enforced

## Workflow

Issues tracked in Linear (project: DEV-36 — S3 Parquet PoC).
Changes use the openspec spec-driven workflow (`openspec/`).
After archiving a change, always mark the corresponding Linear issue as Done.
