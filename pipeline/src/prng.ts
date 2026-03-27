export interface Prng {
  nextFloat(): number;
  nextInt(min: number, max: number): number;
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

  function pick<T>(arr: T[]): T {
    return arr[nextInt(0, arr.length - 1)];
  }

  return { nextFloat, nextInt, pick };
}
