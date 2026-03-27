import { createHash } from "node:crypto";
import type { AnonymizedTransaction, Transaction } from "./types.js";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function anonymize(raw: Transaction): AnonymizedTransaction {
  const { counterparty: _removed, ...rest } = raw;
  return {
    ...rest,
    user_id: sha256(raw.user_id),
    account_id: sha256(raw.account_id),
    iban: sha256(raw.iban),
  };
}
