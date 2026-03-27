import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { tableFromArrays, tableToIPC } from "apache-arrow";
import { Compression, Table, WriterPropertiesBuilder, writeParquet } from "parquet-wasm";
import type { AnonymizedTransaction } from "./types.js";

const s3 = new S3Client({});

function getBucketName(): string {
  const bucket = process.env["BUCKET_NAME"];
  if (!bucket) {
    throw new Error(
      "BUCKET_NAME environment variable is not set. " +
        "Set it to the S3 bucket name before running the pipeline."
    );
  }
  return bucket;
}

export async function writeBatch(batch: {
  year: number;
  month: number;
  transactions: AnonymizedTransaction[];
}): Promise<void> {
  const { year, month, transactions } = batch;
  const bucket = getBucketName();
  const mm = String(month).padStart(2, "0");
  const key = `transactions/year=${year}/month=${mm}/part-0.parquet`;

  // Build Apache Arrow table from plain JS arrays (one per column)
  const arrowTable = tableFromArrays({
    transaction_id: transactions.map((t) => t.transaction_id),
    user_id:        transactions.map((t) => t.user_id),
    account_id:     transactions.map((t) => t.account_id),
    date:           transactions.map((t) => t.date),
    amount:         Float64Array.from(transactions.map((t) => t.amount)),
    currency:       transactions.map((t) => t.currency),
    description:    transactions.map((t) => t.description),
    category:       transactions.map((t) => t.category),
    iban:           transactions.map((t) => t.iban),
  });

  // Bridge apache-arrow → parquet-wasm via Arrow IPC stream format
  const ipcBytes = tableToIPC(arrowTable, "stream");
  const parquetTable = Table.fromIPCStream(ipcBytes);

  // Serialize to Parquet with Snappy compression
  const writerProps = new WriterPropertiesBuilder()
    .setCompression(Compression.SNAPPY)
    .build();
  const parquetBytes = writeParquet(parquetTable, writerProps);

  // Upload to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: parquetBytes,
      ContentType: "application/octet-stream",
    })
  );

  console.log(
    `  → s3://${bucket}/${key} (${(parquetBytes.byteLength / 1024 / 1024).toFixed(2)} MB)`
  );
}
