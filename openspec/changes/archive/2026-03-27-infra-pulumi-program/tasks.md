## 1. Dependencies

- [x] 1.1 Run `npm install` in `infra/` to install `@pulumi/pulumi` and `@pulumi/aws`

## 2. S3 bucket

- [x] 2.1 Define `aws.s3.BucketV2` resource with `forceDestroy: true` and versioning disabled
- [x] 2.2 Add `aws.s3.BucketLifecycleConfigurationV2` rule to abort incomplete multipart uploads after 7 days
- [x] 2.3 Export `bucketName` stack output

## 3. Glue catalog

- [x] 3.1 Define `aws.glue.CatalogDatabase` named `s3_parquet_poc`
- [x] 3.2 Define `aws.glue.CatalogTable` named `transactions` with all 9 anonymized columns (Parquet SerDe, location `s3://<bucket>/transactions/`)
- [x] 3.3 Add partition columns (`year`, `month`) to the table
- [x] 3.4 Add partition projection table parameters (`projection.enabled`, `projection.year.*`, `projection.month.*`, `storage.location.template`)

## 4. Athena workgroup

- [x] 4.1 Define `aws.athena.Workgroup` named `s3-parquet-poc` with results location `s3://<bucket>/athena-results/`
- [x] 4.2 Set `bytesScannedCutoffPerQuery` to 1,073,741,824 (1 GB) and `enforceWorkgroupConfiguration: true`
- [x] 4.3 Export `athenaWorkgroupName` stack output

## 5. Verify

- [x] 5.1 Run `npm run build -w infra` — TypeScript compiles with no errors
- [x] 5.2 Run `npm run typecheck -w infra` — strict mode passes
- [x] 5.3 Run `pulumi preview` from `infra/` — plan shows expected resource creation with no errors
