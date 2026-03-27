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
        weight: 35,
        minAmount: 10,
        maxAmount: 80,
        descriptions: ["Supermarket", "Local market", "Grocery store", "Mini-mart"],
        counterparties: ["Lidl", "Aldi", "Netto", "Rewe", "Penny"],
      },
      rent: {
        weight: 15,
        minAmount: 450,
        maxAmount: 750,
        descriptions: ["Monthly rent"],
        counterparties: ["Landlord GmbH", "Wohnbau AG", "City Housing"],
      },
      utilities: {
        weight: 15,
        minAmount: 40,
        maxAmount: 120,
        descriptions: ["Electricity bill", "Gas bill", "Water bill", "Internet"],
        counterparties: ["Stadtwerke", "EnBW", "Telekom", "Vodafone"],
      },
      transport: {
        weight: 20,
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
        weight: 5,
        minAmount: 5,
        maxAmount: 25,
        descriptions: ["Fast food", "Café", "Bakery"],
        counterparties: ["McDonald's", "Subway", "Bäckerei Müller", "Starbucks"],
      },
    },
  },
  {
    name: "mid",
    salaryMin: 3000,
    salaryMax: 5000,
    txPerAccountMin: 80,
    txPerAccountMax: 130,
    categories: {
      groceries: {
        weight: 20,
        minAmount: 20,
        maxAmount: 150,
        descriptions: ["Supermarket", "Organic market", "Grocery delivery"],
        counterparties: ["Rewe", "Edeka", "Alnatura", "Gorillas"],
      },
      rent: {
        weight: 10,
        minAmount: 800,
        maxAmount: 1400,
        descriptions: ["Monthly rent", "Rent + utilities"],
        counterparties: ["Vonovia", "Deutsche Wohnen", "Private Landlord"],
      },
      utilities: {
        weight: 8,
        minAmount: 60,
        maxAmount: 180,
        descriptions: ["Electricity", "Gas", "Internet & TV"],
        counterparties: ["E.ON", "Vattenfall", "1&1", "Telekom"],
      },
      dining: {
        weight: 18,
        minAmount: 15,
        maxAmount: 80,
        descriptions: ["Restaurant", "Lunch", "Dinner out", "Takeaway"],
        counterparties: ["Vapiano", "Pretzl", "Dean & David", "Deliveroo"],
      },
      subscriptions: {
        weight: 10,
        minAmount: 5,
        maxAmount: 50,
        descriptions: ["Monthly subscription", "Software license", "Gym membership"],
        counterparties: ["Netflix", "Spotify", "Adobe", "McFit"],
      },
      transport: {
        weight: 12,
        minAmount: 10,
        maxAmount: 120,
        descriptions: ["Train ticket", "Taxi", "Car rental", "Fuel"],
        counterparties: ["DB Bahn", "Uber", "Sixt", "Aral"],
      },
      travel: {
        weight: 8,
        minAmount: 50,
        maxAmount: 400,
        descriptions: ["Flight booking", "Hotel stay", "Airbnb"],
        counterparties: ["Lufthansa", "booking.com", "Airbnb", "Ryanair"],
      },
      entertainment: {
        weight: 8,
        minAmount: 10,
        maxAmount: 60,
        descriptions: ["Concert ticket", "Theatre", "Cinema", "Sports event"],
        counterparties: ["Eventim", "Ticketmaster", "Kino.de", "ALBA Berlin"],
      },
      shopping: {
        weight: 6,
        minAmount: 20,
        maxAmount: 200,
        descriptions: ["Clothing", "Electronics", "Online shopping"],
        counterparties: ["Zalando", "Amazon", "H&M", "Media Markt"],
      },
    },
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
      rent: {
        weight: 6,
        minAmount: 2000,
        maxAmount: 4000,
        descriptions: ["Monthly rent", "Property management fee"],
        counterparties: ["Savills", "JLL Residential", "Prime Properties GmbH"],
      },
      restaurants: {
        weight: 18,
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
      subscriptions: {
        weight: 8,
        minAmount: 20,
        maxAmount: 200,
        descriptions: ["Premium subscription", "Club membership", "Software suite"],
        counterparties: ["Bloomberg", "FT", "LinkedIn Premium", "AWS"],
      },
      utilities: {
        weight: 5,
        minAmount: 100,
        maxAmount: 400,
        descriptions: ["Electricity", "Gas", "Property maintenance"],
        counterparties: ["E.ON", "Techem", "Brunata"],
      },
      luxury: {
        weight: 10,
        minAmount: 200,
        maxAmount: 2000,
        descriptions: ["Jewellery", "Designer clothing", "Art purchase", "Watch service"],
        counterparties: ["Rolex", "Hugo Boss", "Galerie König", "Tiffany & Co"],
      },
      transport: {
        weight: 5,
        minAmount: 50,
        maxAmount: 300,
        descriptions: ["Private car service", "First class rail", "Airport transfer"],
        counterparties: ["Blacklane", "DB First Class", "Mercedes-Benz"],
      },
      health: {
        weight: 5,
        minAmount: 50,
        maxAmount: 500,
        descriptions: ["Private clinic", "Dental", "Wellness spa", "Personal trainer"],
        counterparties: ["Charité Private", "Sanitas", "Lanserhof", "SportX"],
      },
    },
  },
];

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

function isoDate(year: number, month: number, rng: ReturnType<typeof createPrng>): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = rng.nextInt(1, daysInMonth);
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`;
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
  } = config;

  const rng = createPrng(seed);

  // Pre-generate stable user/account structure
  const users: Array<{
    userId: string;
    archetype: UserArchetype;
    accounts: Array<{ accountId: string; iban: string }>;
  }> = [];

  for (let u = 0; u < numUsers; u++) {
    const userId = `user_${pad(u)}`;
    const archetype = ARCHETYPES[u % ARCHETYPES.length];
    const accounts = [];
    for (let a = 0; a < accountsPerUser; a++) {
      const accountId = `acc_${pad(u * accountsPerUser + a)}`;
      const iban = randomIban(rng);
      accounts.push({ accountId, iban });
    }
    users.push({ userId, archetype, accounts });
  }

  // Iterate months
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const transactions: Transaction[] = [];

    for (const user of users) {
      const { userId, archetype, accounts } = user;

      for (const { accountId, iban } of accounts) {
        // One salary credit per user per month (on first account only)
        if (accountId === accounts[0].accountId) {
          const salary = rng.nextInt(archetype.salaryMin, archetype.salaryMax);
          transactions.push({
            transaction_id: randomUUID(),
            user_id: userId,
            account_id: accountId,
            date: isoDate(year, month, rng),
            amount: salary,
            currency: "EUR",
            description: "Monthly salary",
            category: "salary",
            counterparty: "Employer AG",
            iban,
          });
        }

        // Spend transactions
        const txCount = rng.nextInt(
          archetype.txPerAccountMin,
          Math.max(archetype.txPerAccountMin, transactionsPerAccountPerMonth)
        );

        for (let t = 0; t < txCount; t++) {
          const category = weightedCategory(archetype.categories, rng);
          const profile = archetype.categories[category];
          const amount = -(rng.nextInt(profile.minAmount * 100, profile.maxAmount * 100) / 100);

          transactions.push({
            transaction_id: randomUUID(),
            user_id: userId,
            account_id: accountId,
            date: isoDate(year, month, rng),
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

    // Advance month
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
};
