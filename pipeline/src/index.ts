import { anonymize } from "./anonymizer.js";
import { DEFAULT_CONFIG, generateTransactions } from "./generator.js";
import type { GeneratorConfig } from "./types.js";
import { writeBatch } from "./writer.js";

function parseEnvInt(key: string, fallback: number): number {
  const val = process.env[key];
  if (val === undefined) return fallback;
  const parsed = parseInt(val, 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.error(`Warning: invalid ${key}="${val}", using default ${fallback}`);
    return fallback;
  }
  return parsed;
}

function parseEnvFloat(key: string, fallback: number): number {
  const val = process.env[key];
  if (val === undefined) return fallback;
  const parsed = parseFloat(val);
  if (isNaN(parsed) || parsed < 0 || parsed > 1) {
    console.error(`Warning: invalid ${key}="${val}" (must be 0.0–1.0), using default ${fallback}`);
    return fallback;
  }
  return parsed;
}

async function main(): Promise<void> {
  const config: GeneratorConfig = {
    ...DEFAULT_CONFIG,
    numUsers:                      parseEnvInt("NUM_USERS",      DEFAULT_CONFIG.numUsers),
    transactionsPerAccountPerMonth: parseEnvInt("TX_PER_ACCOUNT", DEFAULT_CONFIG.transactionsPerAccountPerMonth),
    seed:                          parseEnvInt("SEED",            DEFAULT_CONFIG.seed),
    churnRate:                     parseEnvFloat("CHURN_RATE",    DEFAULT_CONFIG.churnRate ?? 0),
  };

  const envOverrides = ["NUM_USERS", "TX_PER_ACCOUNT", "SEED", "CHURN_RATE"]
    .filter(k => process.env[k] !== undefined);

  console.log("Starting transaction generation...");
  console.log(
    `Config: ${config.numUsers} users × ~${config.transactionsPerAccountPerMonth} tx/account/month × 24 months (account count varies by archetype)`
  );
  if (config.churnRate) console.log(`Churn rate: ${config.churnRate}`);
  if (envOverrides.length) console.log(`Env overrides: ${envOverrides.join(", ")}`);

  let totalTransactions = 0;
  let batchCount = 0;

  for await (const batch of generateTransactions(config)) {
    totalTransactions += batch.transactions.length;
    batchCount++;
    console.log(
      `  Batch ${batchCount}/24: ${batch.year}-${String(batch.month).padStart(2, "0")} — ${batch.transactions.length.toLocaleString()} transactions`
    );
    const anonymized = batch.transactions.map(anonymize);
    await writeBatch({ year: batch.year, month: batch.month, transactions: anonymized });
  }

  console.log(
    `\nDone. ${batchCount} batches, ${totalTransactions.toLocaleString()} total transactions.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
