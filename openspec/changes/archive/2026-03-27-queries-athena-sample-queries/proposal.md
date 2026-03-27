## Why

The pipeline is complete and 24 partitions are live on S3. This change adds the four sample Athena SQL queries, proving the data is queryable via the Glue catalog without any local tooling.

## What Changes

- Replace `queries/athena/sample.sql` placeholder with four standalone `.sql` files, one per query
- Each file is runnable directly in the Athena console or via the AWS CLI against the `s3-parquet-poc` workgroup

## Capabilities

### New Capabilities

- `athena-queries`: Four `.sql` files covering distinct users, accounts per user, overall amount stats, and per-month amount stats

### Modified Capabilities

<!-- none -->

## Impact

- Replaces `queries/athena/sample.sql` with four focused query files
- No code changes — SQL only
- Requires the Glue table and Athena workgroup provisioned by DEV-38
