## Why

The pipeline and query workspaces need AWS infrastructure before they can run: an S3 bucket to store Parquet files, a Glue catalog so Athena can query them, and an Athena workgroup with a cost guardrail. This change provisions all three with Pulumi so the environment is reproducible and version-controlled.

## What Changes

- Replace the `infra/src/index.ts` placeholder with a working Pulumi program
- Add an S3 bucket (`transactions` prefix) with versioning off and a lifecycle rule to expire incomplete multipart uploads
- Add a Glue database (`s3_parquet_poc`) and table (`transactions`) with the anonymized schema and partition projection on `year`/`month`
- Add an Athena workgroup (`s3-parquet-poc`) with a 1 GB per-query scan limit and results written to `s3://<bucket>/athena-results/`
- Export `bucketName` and `athenaWorkgroupName` as Pulumi stack outputs

## Capabilities

### New Capabilities

- `s3-bucket`: S3 bucket for Parquet storage with lifecycle rules
- `glue-catalog`: Glue database + table with partition projection over the transactions data
- `athena-workgroup`: Athena workgroup with scan limit and results location

### Modified Capabilities

- `infra-workspace`: Entry point changes from placeholder to real Pulumi program (no spec-level requirement change — implementation detail only)

## Impact

- Modifies `infra/src/index.ts` (replaces placeholder)
- No new npm dependencies needed beyond `@pulumi/pulumi` and `@pulumi/aws` already declared
- Requires AWS credentials and a Pulumi stack (`pulumi stack init`) before `pulumi up` can run — out of scope for this change
