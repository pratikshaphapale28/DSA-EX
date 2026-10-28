import type { HashFunctionType } from '../../types/hash';

export interface HashResult {
  hash: number;
  explanation: string;
}

const KNUTH_GOLDEN_RATIO = 0.618033988749895; // (sqrt(5) - 1) / 2

/**
 * Computes hash index and mathematical step-by-step derivation.
 */
export function computeHash(
  key: string | number,
  capacity: number,
  fn: HashFunctionType
): HashResult {
  const m = Math.max(1, capacity);

  // Convert string to numeric seed if needed
  let numericKey: number;
  let isString = typeof key === 'string';

  if (isString) {
    let charSum = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      charSum = (charSum * 31 + str.charCodeAt(i)) >>> 0;
    }
    numericKey = charSum;
  } else {
    numericKey = Math.abs(Number(key));
  }

  if (fn === 'division') {
    const hash = numericKey % m;
    const explanation = isString
      ? `Division Method (ASCII sum for Division on strings): hash("${key}") → sum ${numericKey} mod ${m} = ${hash}`
      : `Division Method: ${numericKey} mod ${m} = ${hash}`;
    return { hash, explanation };
  }

  if (fn === 'multiplication') {
    // Multiplication method: floor(m * ((k * A) mod 1))
    const product = numericKey * KNUTH_GOLDEN_RATIO;
    const fractionalPart = product - Math.floor(product);
    const hash = Math.floor(m * fractionalPart);

    const explanation = `Multiplication Method: ⌊${m} × ((${numericKey} × 0.618034) mod 1)⌋ = ⌊${m} × ${fractionalPart.toFixed(4)}⌋ = ${hash}`;
    return { hash, explanation };
  }

  if (fn === 'string-poly') {
    // Polynomial rolling hash
    const str = String(key);
    let hashVal = 0;
    const terms: string[] = [];

    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      hashVal = (hashVal * 31 + code) % m;
      if (i < 3) {
        terms.push(`'${str[i]}'(${code})`);
      }
    }

    const explanation = `Polynomial String Hash (base-31 polynomial for the String hash): (${terms.join(' · 31 + ')}) mod ${m} = ${hashVal}`;
    return { hash: hashVal, explanation };
  }

  // Fallback division
  const hash = numericKey % m;
  return { hash, explanation: `${numericKey} mod ${m} = ${hash}` };
}
