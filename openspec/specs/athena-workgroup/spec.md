## ADDED Requirements

### Requirement: Athena workgroup with scan limit
The Pulumi program SHALL create an Athena workgroup named `s3-parquet-poc` with:
- Per-query data scan limit of 1 GB (1,073,741,824 bytes)
- Query results written to `s3://<bucket>/athena-results/`
- `enforceWorkgroupConfiguration: true` so clients cannot override the scan limit

#### Scenario: Workgroup exists after pulumi up
- **WHEN** `pulumi up` completes
- **THEN** an Athena workgroup named `s3-parquet-poc` exists

#### Scenario: Query exceeding 1 GB scan is rejected
- **WHEN** an Athena query would scan more than 1 GB of data
- **THEN** Athena rejects the query with a scan limit exceeded error before incurring full cost

#### Scenario: Query results land in S3
- **WHEN** an Athena query completes successfully
- **THEN** the result CSV is written to `s3://<bucket>/athena-results/`

### Requirement: Stack output for workgroup name
The Pulumi program SHALL export the Athena workgroup name as a stack output named `athenaWorkgroupName`.

#### Scenario: athenaWorkgroupName output is available after pulumi up
- **WHEN** `pulumi stack output athenaWorkgroupName` is run after a successful deploy
- **THEN** it returns `s3-parquet-poc`
