import { DEFAULT_CONFIG, generateTransactions } from "./generator.js";

async function main(): Promise<void> {
  const config = DEFAULT_CONFIG;

  console.log("Starting transaction generation...");
  console.log(
    `Config: ${config.numUsers} users × ${config.accountsPerUser} accounts × ~${config.transactionsPerAccountPerMonth} tx/account/month × 24 months`
  );

  let totalTransactions = 0;
  let batchCount = 0;

  for await (const batch of generateTransactions(config)) {
    totalTransactions += batch.transactions.length;
    batchCount++;
    console.log(
      `  Batch ${batchCount}/24: ${batch.year}-${String(batch.month).padStart(2, "0")} — ${batch.transactions.length.toLocaleString()} transactions`
    );
    // TODO DEV-40: anonymize(batch.transactions)
    // TODO DEV-41: writeParquet(batch)
  }

  console.log(
    `\nDone. ${batchCount} batches, ${totalTransactions.toLocaleString()} total transactions.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
