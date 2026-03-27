## Context

The `infra/` workspace is scaffolded (DEV-37 done) with `@pulumi/pulumi` and `@pulumi/aws` declared as dependencies. `infra/src/index.ts` is currently a placeholder. This change writes the real Pulumi program.

AWS resources needed:
1. **S3 bucket** — stores partitioned Parquet files and Athena query results
2. **Glue database + table** — metadata layer that lets Athena query S3 without manual partition registration
3. **Athena workgroup** — enforces a 1 GB per-query scan cap and routes results to S3

All resources live in a single Pulumi stack (`dev`). No multi-account or multi-region setup.

## Goals / Non-Goals

**Goals:**
- All resources defined in `infra/src/index.ts` as a single Pulumi component
- `pulumi up` provisions everything idempotently from scratch
- `pulumi destroy` tears it all down cleanly
- Stack outputs: `bucketName`, `athenaWorkgroupName`
- TypeScript compiles cleanly with strict mode

**Non-Goals:**
- Pulumi backend configuration or stack init (manual one-time step)
- IAM roles/policies (use existing AWS credentials with sufficient permissions)
- Multi-environment stacks (single `dev` stack for this PoC)
- S3 bucket policies or block-public-access settings beyond defaults
- CloudWatch metrics or alerting on Athena spend

## Decisions

### 1. Partition projection over MSCK REPAIR TABLE
Glue partition projection is configured via table parameters. It makes new partitions queryable immediately without running `MSCK REPAIR TABLE` after each pipeline run. The projection covers `year` (2024–2030, integer) and `month` (01–12, injected as zero-padded string).

**Alternative:** `MSCK REPAIR TABLE` after each upload — works but requires an extra Athena step and doesn't scale.

### 2. Athena results stored in the same S3 bucket under `athena-results/` prefix
Keeps the bucket count low (cost + simplicity). A lifecycle rule can expire results independently if needed later.

**Alternative:** Separate S3 bucket for Athena results — cleaner separation but more resources to manage.

### 3. Single `index.ts` — no component classes
Three resources (S3, Glue, Athena) don't justify a component abstraction. Keeps the program readable as a linear top-to-bottom script.

**Alternative:** `ComponentResource` subclasses — useful if this grows to multiple environments or reusable modules, not warranted here.

### 4. Glue column type for `amount`
`amount` is `number` in TypeScript (positive=credit, negative=debit). Glue/Athena maps this to `double`. An alternative is `decimal(18,2)` for exact currency arithmetic, but since this is synthetic data for querying patterns (not financial accuracy), `double` is fine.

### 5. Lifecycle rule: expire incomplete multipart uploads after 7 days
Parquet writes use multipart upload. Abandoned uploads accumulate storage costs silently. 7-day expiry is a safe baseline.

## Risks / Trade-offs

- **Partition projection year range hardcoded to 2024–2030** → If data ever goes outside this range, Athena silently returns no results. Mitigation: widen range or make it a Pulumi config value. Fine for this PoC.
- **No bucket versioning** → Accidental overwrites are unrecoverable. Intentional (cost), acceptable for synthetic data.
- **Glue schema drift** → If the pipeline writes columns not declared in the Glue table, Athena ignores them. Mitigation: keep schema in sync manually; document it.
- **`pulumi destroy` deletes S3 bucket only if empty** → Pulumi's default for S3 is `retainOnDelete: false` but it will fail if the bucket has objects. Mitigation: set `forceDestroy: true` on the bucket for this PoC.
