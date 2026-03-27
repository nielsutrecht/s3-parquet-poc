import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// ---------------------------------------------------------------------------
// S3 Bucket
// ---------------------------------------------------------------------------

const bucket = new aws.s3.BucketV2("transactions", {
  forceDestroy: true,
});

// Versioning explicitly disabled (default, but made explicit for clarity)
new aws.s3.BucketVersioningV2("transactions-versioning", {
  bucket: bucket.id,
  versioningConfiguration: {
    status: "Disabled",
  },
});

// Abort incomplete multipart uploads after 7 days
new aws.s3.BucketLifecycleConfigurationV2("transactions-lifecycle", {
  bucket: bucket.id,
  rules: [
    {
      id: "abort-incomplete-mpu",
      status: "Enabled",
      abortIncompleteMultipartUpload: {
        daysAfterInitiation: 7,
      },
    },
  ],
});

export const bucketName = bucket.id;

// ---------------------------------------------------------------------------
// Glue Catalog
// ---------------------------------------------------------------------------

const glueDatabase = new aws.glue.CatalogDatabase("s3_parquet_poc", {
  name: "s3_parquet_poc",
});

new aws.glue.CatalogTable("transactions", {
  name: "transactions",
  databaseName: glueDatabase.name,
  tableType: "EXTERNAL_TABLE",
  parameters: {
    // Partition projection
    "projection.enabled": "true",
    "projection.year.type": "integer",
    "projection.year.range": "2024,2030",
    "projection.month.type": "injected",
    "storage.location.template": pulumi.interpolate`s3://${bucket.id}/transactions/year=\${year}/month=\${month}`,
    // Parquet
    "classification": "parquet",
  },
  storageDescriptor: {
    location: pulumi.interpolate`s3://${bucket.id}/transactions/`,
    inputFormat: "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat",
    outputFormat: "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat",
    serDeInfo: {
      serializationLibrary:
        "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe",
    },
    columns: [
      { name: "transaction_id", type: "string" },
      { name: "user_id",        type: "string" },
      { name: "account_id",     type: "string" },
      { name: "date",           type: "string" },
      { name: "amount",         type: "double" },
      { name: "currency",       type: "string" },
      { name: "description",    type: "string" },
      { name: "category",       type: "string" },
      { name: "iban",           type: "string" },
    ],
  },
  partitionKeys: [
    { name: "year",  type: "string" },
    { name: "month", type: "string" },
  ],
});

// ---------------------------------------------------------------------------
// Athena Workgroup
// ---------------------------------------------------------------------------

const workgroup = new aws.athena.Workgroup("s3-parquet-poc", {
  name: "s3-parquet-poc",
  configuration: {
    enforceWorkgroupConfiguration: true,
    resultConfiguration: {
      outputLocation: pulumi.interpolate`s3://${bucket.id}/athena-results/`,
    },
    bytesScannedCutoffPerQuery: 1_073_741_824, // 1 GB
  },
});

export const athenaWorkgroupName = workgroup.name;
