export interface Transaction {
  transaction_id: string;
  user_id: string;
  account_id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  counterparty: string;
  iban: string;
}

export interface GeneratorConfig {
  numUsers: number;
  accountsPerUser: number;
  transactionsPerAccountPerMonth: number;
  seed: number;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export interface CategoryProfile {
  weight: number;
  minAmount: number;
  maxAmount: number;
  descriptions: string[];
  counterparties: string[];
}

export interface UserArchetype {
  name: string;
  salaryMin: number;
  salaryMax: number;
  txPerAccountMin: number;
  txPerAccountMax: number;
  categories: Record<string, CategoryProfile>;
}

export type AnonymizedTransaction = Omit<Transaction, "counterparty">;

export interface GeneratorBatch {
  year: number;
  month: number;
  transactions: Transaction[];
}
