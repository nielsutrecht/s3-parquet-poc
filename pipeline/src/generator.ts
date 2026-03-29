import { randomUUID } from "node:crypto";
import { createPrng } from "./prng.js";
import type {
  GeneratorBatch,
  GeneratorConfig,
  Transaction,
  UserArchetype,
} from "./types.js";

// ---------------------------------------------------------------------------
// Archetype definitions
// ---------------------------------------------------------------------------

const ARCHETYPES: UserArchetype[] = [
  {
    name: "low",
    salaryMin: 1200,
    salaryMax: 2000,
    txPerAccountMin: 60,
    txPerAccountMax: 100,
    categories: {
      groceries: {
        weight: 40,
        minAmount: 10,
        maxAmount: 80,
        descriptions: ["Supermarket", "Local market", "Grocery store", "Mini-mart"],
        counterparties: ["Lidl", "Aldi", "Netto", "Rewe", "Penny"],
      },
      utilities: {
        weight: 20,
        minAmount: 40,
        maxAmount: 120,
        descriptions: ["Electricity bill", "Gas bill", "Water bill", "Internet"],
        counterparties: ["Stadtwerke", "EnBW", "Telekom", "Vodafone"],
      },
      transport: {
        weight: 22,
        minAmount: 5,
        maxAmount: 60,
        descriptions: ["Bus ticket", "Monthly transit pass", "Fuel", "Train ticket"],
        counterparties: ["BVG", "DB Bahn", "ARAL", "Shell"],
      },
      entertainment: {
        weight: 10,
        minAmount: 5,
        maxAmount: 30,
        descriptions: ["Cinema ticket", "Streaming service", "Mobile top-up"],
        counterparties: ["Netflix", "Spotify", "Kino.de", "O2"],
      },
      dining: {
        weight: 8,
        minAmount: 5,
        maxAmount: 25,
        descriptions: ["Fast food", "Café", "Bakery"],
        counterparties: ["McDonald's", "Subway", "Bäckerei Müller", "Starbucks"],
      },
    },
    recurringRent: { minAmount: 450, maxAmount: 750, counterparties: ["Landlord GmbH", "Wohnbau AG", "City Housing"] },
    recurringSubscription: { minAmount: 8, maxAmount: 15, counterparties: ["Netflix", "Spotify", "O2"] },
  },
  {
    name: "mid",
    salaryMin: 3000,
    salaryMax: 5000,
    txPerAccountMin: 80,
    txPerAccountMax: 130,
    categories: {
      groceries: {
        weight: 22,
        minAmount: 20,
        maxAmount: 150,
        descriptions: ["Supermarket", "Organic market", "Grocery delivery"],
        counterparties: ["Rewe", "Edeka", "Alnatura", "Gorillas"],
      },
      utilities: {
        weight: 10,
        minAmount: 60,
        maxAmount: 180,
        descriptions: ["Electricity", "Gas", "Internet & TV"],
        counterparties: ["E.ON", "Vattenfall", "1&1", "Telekom"],
      },
      dining: {
        weight: 20,
        minAmount: 15,
        maxAmount: 80,
        descriptions: ["Restaurant", "Lunch", "Dinner out", "Takeaway"],
        counterparties: ["Vapiano", "Pretzl", "Dean & David", "Deliveroo"],
      },
      transport: {
        weight: 14,
        minAmount: 10,
        maxAmount: 120,
        descriptions: ["Train ticket", "Taxi", "Car rental", "Fuel"],
        counterparties: ["DB Bahn", "Uber", "Sixt", "Aral"],
      },
      travel: {
        weight: 10,
        minAmount: 50,
        maxAmount: 400,
        descriptions: ["Flight booking", "Hotel stay", "Airbnb"],
        counterparties: ["Lufthansa", "booking.com", "Airbnb", "Ryanair"],
      },
      entertainment: {
        weight: 10,
        minAmount: 10,
        maxAmount: 60,
        descriptions: ["Concert ticket", "Theatre", "Cinema", "Sports event"],
        counterparties: ["Eventim", "Ticketmaster", "Kino.de", "ALBA Berlin"],
      },
      shopping: {
        weight: 14,
        minAmount: 20,
        maxAmount: 200,
        descriptions: ["Clothing", "Electronics", "Online shopping"],
        counterparties: ["Zalando", "Amazon", "H&M", "Media Markt"],
      },
    },
    recurringRent: { minAmount: 800, maxAmount: 1400, counterparties: ["Vonovia", "Deutsche Wohnen", "Private Landlord"] },
    recurringSubscription: { minAmount: 10, maxAmount: 50, counterparties: ["Netflix", "Spotify", "Adobe", "McFit"] },
  },
  {
    name: "high",
    salaryMin: 8000,
    salaryMax: 15000,
    txPerAccountMin: 100,
    txPerAccountMax: 160,
    categories: {
      groceries: {
        weight: 8,
        minAmount: 50,
        maxAmount: 300,
        descriptions: ["Premium supermarket", "Organic delivery", "Wine merchant"],
        counterparties: ["KaDeWe Food", "Whole Foods", "Manufactum", "Hawesko"],
      },
      restaurants: {
        weight: 20,
        minAmount: 50,
        maxAmount: 400,
        descriptions: ["Fine dining", "Business lunch", "Sushi restaurant", "Wine bar"],
        counterparties: ["Borchardt", "Nobelhart", "Tim Raue", "Rutz"],
      },
      travel: {
        weight: 20,
        minAmount: 200,
        maxAmount: 3000,
        descriptions: ["Business class flight", "Hotel", "Airport lounge", "Car hire"],
        counterparties: ["Lufthansa Business", "Marriott", "Hertz", "AmEx Travel"],
      },
      investments: {
        weight: 15,
        minAmount: 500,
        maxAmount: 5000,
        descriptions: ["ETF purchase", "Stock purchase", "Bond investment"],
        counterparties: ["Comdirect", "Scalable Capital", "DWS", "BlackRock"],
      },
      utilities: {
        weight: 5,
        minAmount: 100,
        maxAmount: 400,
        descriptions: ["Electricity", "Gas", "Property maintenance"],
        counterparties: ["E.ON", "Techem", "Brunata"],
      },
      luxury: {
        weight: 12,
        minAmount: 200,
        maxAmount: 2000,
        descriptions: ["Jewellery", "Designer clothing", "Art purchase", "Watch service"],
        counterparties: ["Rolex", "Hugo Boss", "Galerie König", "Tiffany & Co"],
      },
      transport: {
        weight: 8,
        minAmount: 50,
        maxAmount: 300,
        descriptions: ["Private car service", "First class rail", "Airport transfer"],
        counterparties: ["Blacklane", "DB First Class", "Mercedes-Benz"],
      },
      health: {
        weight: 7,
        minAmount: 50,
        maxAmount: 500,
        descriptions: ["Private clinic", "Dental", "Wellness spa", "Personal trainer"],
        counterparties: ["Charité Private", "Sanitas", "Lanserhof", "SportX"],
      },
      shopping: {
        weight: 5,
        minAmount: 100,
        maxAmount: 1000,
        descriptions: ["Online shopping", "Department store"],
        counterparties: ["Amazon", "KaDeWe", "Galeries Lafayette"],
      },
    },
    recurringRent: { minAmount: 2000, maxAmount: 4000, counterparties: ["Savills", "JLL Residential", "Prime Properties GmbH"] },
    recurringSubscription: { minAmount: 20, maxAmount: 200, counterparties: ["Bloomberg", "FT", "LinkedIn Premium", "AWS"] },
  },
];

// ---------------------------------------------------------------------------
// Seasonal multipliers (month 1–12 → tx count multiplier)
// ---------------------------------------------------------------------------

const SEASONAL_MULTIPLIERS: Record<number, number> = {
  1:  0.80, // January — post-holiday quiet
  2:  0.85,
  3:  0.95,
  4:  1.00,
  5:  1.05,
  6:  1.10, // Summer ramp-up
  7:  1.15,
  8:  1.10,
  9:  1.00,
  10: 1.05,
  11: 1.10, // Pre-Christmas
  12: 1.30, // December peak
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(n: number, digits = 4): string {
  return String(n).padStart(digits, "0");
}

function randomIban(rng: ReturnType<typeof createPrng>): string {
  let digits = "DE";
  for (let i = 0; i < 20; i++) digits += rng.nextInt(0, 9);
  return digits;
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`;
}

function randomDay(year: number, month: number, rng: ReturnType<typeof createPrng>): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  return rng.nextInt(1, daysInMonth);
}

function weightedCategory(
  categories: Record<string, { weight: number }>,
  rng: ReturnType<typeof createPrng>
): string {
  const total = Object.values(categories).reduce((s, c) => s + c.weight, 0);
  let roll = rng.nextFloat() * total;
  for (const [name, cat] of Object.entries(categories)) {
    roll -= cat.weight;
    if (roll <= 0) return name;
  }
  return Object.keys(categories)[0];
}

// Derive log-normal mu/sigma from a min/max range so ~90% of samples fall within.
// Uses the fact that for log-normal: P(X < max) ≈ 0.95 → mu + 1.645*sigma = ln(max)
//                                    P(X < min) ≈ 0.05 → mu - 1.645*sigma = ln(min)
function lognormalParams(min: number, max: number): { mu: number; sigma: number } {
  const lnMin = Math.log(Math.max(min, 0.01));
  const lnMax = Math.log(Math.max(max, 0.01));
  const mu = (lnMin + lnMax) / 2;
  const sigma = (lnMax - lnMin) / (2 * 1.645);
  return { mu, sigma };
}

function lognormalAmount(
  min: number,
  max: number,
  rng: ReturnType<typeof createPrng>
): number {
  const { mu, sigma } = lognormalParams(min, max);
  const raw = rng.nextLogNormal(mu, sigma);
  // Clamp to [min*0.5, max*3] to avoid extreme outliers while preserving tail
  return Math.round(Math.min(Math.max(raw, min * 0.5), max * 3) * 100) / 100;
}

// Total months between two year/month pairs (inclusive)
function totalMonths(
  startYear: number, startMonth: number,
  endYear: number, endMonth: number
): number {
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

// Convert a month index (0-based from start) back to { year, month }
function monthFromIndex(
  startYear: number, startMonth: number, index: number
): { year: number; month: number } {
  const total = startMonth - 1 + index;
  return { year: startYear + Math.floor(total / 12), month: (total % 12) + 1 };
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export async function* generateTransactions(
  config: GeneratorConfig
): AsyncGenerator<GeneratorBatch> {
  const {
    numUsers,
    accountsPerUser,
    transactionsPerAccountPerMonth,
    seed,
    startYear,
    startMonth,
    endYear,
    endMonth,
    churnRate = 0,
  } = config;

  const rng = createPrng(seed);
  const numMonths = totalMonths(startYear, startMonth, endYear, endMonth);

  // Pre-generate stable user/account structure + optional churn cutoff
  const users: Array<{
    userId: string;
    archetype: UserArchetype;
    accounts: Array<{ accountId: string; iban: string; subscriptionDay: number }>;
    churnAfterIndex: number | null; // month index (0-based) after which user is inactive
  }> = [];

  for (let u = 0; u < numUsers; u++) {
    const userId = `user_${pad(u)}`;
    const archetype = ARCHETYPES[u % ARCHETYPES.length];
    const accounts = [];
    for (let a = 0; a < accountsPerUser; a++) {
      const accountId = `acc_${pad(u * accountsPerUser + a)}`;
      const iban = randomIban(rng);
      // Stable subscription day per account: between 5th and 28th
      const subscriptionDay = 5 + (u * accountsPerUser + a) % 24;
      accounts.push({ accountId, iban, subscriptionDay });
    }
    const churns = churnRate > 0 && rng.nextFloat() < churnRate;
    const churnAfterIndex = churns ? rng.nextInt(0, numMonths - 2) : null;
    users.push({ userId, archetype, accounts, churnAfterIndex });
  }

  // Iterate months
  let monthIndex = 0;
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const transactions: Transaction[] = [];
    const seasonal = SEASONAL_MULTIPLIERS[month] ?? 1.0;

    for (const user of users) {
      // Skip churned users
      if (user.churnAfterIndex !== null && monthIndex > user.churnAfterIndex) continue;

      const { userId, archetype, accounts } = user;

      for (const { accountId, iban, subscriptionDay } of accounts) {
        // One salary credit per user per month (on first account only)
        if (accountId === accounts[0].accountId) {
          const salary = rng.nextInt(archetype.salaryMin, archetype.salaryMax);
          transactions.push({
            transaction_id: randomUUID(),
            user_id: userId,
            account_id: accountId,
            date: isoDate(year, month, rng.nextInt(1, 5)), // salary in first 5 days
            amount: salary,
            currency: "EUR",
            description: "Monthly salary",
            category: "salary",
            counterparty: "Employer AG",
            iban,
          });
        }

        // Recurring rent — always on day 1
        const rentProfile = archetype.recurringRent;
        transactions.push({
          transaction_id: randomUUID(),
          user_id: userId,
          account_id: accountId,
          date: isoDate(year, month, 1),
          amount: -lognormalAmount(rentProfile.minAmount, rentProfile.maxAmount, rng),
          currency: "EUR",
          description: "Monthly rent",
          category: "rent",
          counterparty: rng.pick(rentProfile.counterparties),
          iban,
        });

        // Recurring subscription — on stable per-account day
        const subProfile = archetype.recurringSubscription;
        const daysInMonth = new Date(year, month, 0).getDate();
        const clampedSubDay = Math.min(subscriptionDay, daysInMonth);
        transactions.push({
          transaction_id: randomUUID(),
          user_id: userId,
          account_id: accountId,
          date: isoDate(year, month, clampedSubDay),
          amount: -lognormalAmount(subProfile.minAmount, subProfile.maxAmount, rng),
          currency: "EUR",
          description: "Monthly subscription",
          category: "subscriptions",
          counterparty: rng.pick(subProfile.counterparties),
          iban,
        });

        // Variable spend transactions with seasonal scaling
        const baseCount = rng.nextInt(
          archetype.txPerAccountMin,
          Math.max(archetype.txPerAccountMin, transactionsPerAccountPerMonth)
        );
        const txCount = Math.round(baseCount * seasonal);

        for (let t = 0; t < txCount; t++) {
          const category = weightedCategory(archetype.categories, rng);
          const profile = archetype.categories[category];
          const amount = -lognormalAmount(profile.minAmount, profile.maxAmount, rng);

          transactions.push({
            transaction_id: randomUUID(),
            user_id: userId,
            account_id: accountId,
            date: isoDate(year, month, randomDay(year, month, rng)),
            amount,
            currency: "EUR",
            description: rng.pick(profile.descriptions),
            category,
            counterparty: rng.pick(profile.counterparties),
            iban,
          });
        }
      }
    }

    yield { year, month, transactions };

    monthIndex++;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
}

export const DEFAULT_CONFIG: GeneratorConfig = {
  numUsers: 100,
  accountsPerUser: 10,
  transactionsPerAccountPerMonth: 85,
  seed: 42,
  startYear: 2024,
  startMonth: 1,
  endYear: 2025,
  endMonth: 12,
  churnRate: 0,
};
