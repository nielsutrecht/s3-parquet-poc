## ADDED Requirements

### Requirement: S3 bucket for Parquet storage
The Pulumi program SHALL create an S3 bucket with:
- Versioning disabled
- `forceDestroy: true` so `pulumi destroy` succeeds even when the bucket contains objects
- A lifecycle rule that expires incomplete multipart uploads after 7 days

#### Scenario: Bucket is created by pulumi up
- **WHEN** `pulumi up` is run against a fresh AWS account/region
- **THEN** an S3 bucket exists and is accessible with the AWS credentials used

#### Scenario: Incomplete multipart uploads are cleaned up
- **WHEN** a multipart upload is abandoned
- **THEN** AWS automatically deletes the parts after 7 days via the lifecycle rule

#### Scenario: pulumi destroy removes the bucket
- **WHEN** `pulumi destroy` is run and the bucket contains objects
- **THEN** Pulumi deletes all objects and removes the bucket without error (forceDestroy)

### Requirement: Stack output for bucket name
The Pulumi program SHALL export the bucket name as a stack output named `bucketName`.

#### Scenario: bucketName output is available after pulumi up
- **WHEN** `pulumi stack output bucketName` is run after a successful deploy
- **THEN** it returns the actual S3 bucket name
