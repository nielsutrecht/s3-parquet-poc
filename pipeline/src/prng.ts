export interface Prng {
  nextFloat(): number;
  nextInt(min: number, max: number): number;
  nextLogNormal(mu: number, sigma: number): number;
  pick<T>(arr: T[]): T;
}

// mulberry32 — fast, good-quality 32-bit seeded PRNG
export function createPrng(seed: number): Prng {
  let s = seed >>> 0;

  function nextFloat(): number {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    return min + Math.floor(nextFloat() * (max - min + 1));
  }

  // Box-Muller transform: two uniform samples → one standard normal variate,
  // then exponentiated to produce a log-normal sample.
  function nextLogNormal(mu: number, sigma: number): number {
    const u1 = Math.max(nextFloat(), 1e-10); // avoid log(0)
    const u2 = nextFloat();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.exp(mu + sigma * z);
  }

  function pick<T>(arr: T[]): T {
    return arr[nextInt(0, arr.length - 1)];
  }

  return { nextFloat, nextInt, nextLogNormal, pick };
}
