import { describe, it, expect } from 'vitest';
import { generateLinearSearchSteps } from '../src/algorithms/searching/linearSearch';
import {
  generateBinarySearchSteps,
  isArraySortedAscending,
} from '../src/algorithms/searching/binarySearch';

describe('Linear Search Step Generator', () => {
  it('correctly finds element in middle of array', () => {
    const array = [10, 20, 30, 40, 50];
    const target = 30;
    const steps = generateLinearSearchSteps({ array, target });

    const finalStep = steps[steps.length - 1];
    expect(finalStep.auxiliaryState.foundIndex).toBe(2);

    const foundStep = steps.find((s) => s.type === 'found');
    expect(foundStep).toBeDefined();
    expect(foundStep?.highlightedIndices).toEqual([2]);
    expect(foundStep?.counters.comparisons).toBe(3);
  });

  it('correctly handles best case (target at index 0)', () => {
    const array = [99, 10, 20];
    const steps = generateLinearSearchSteps({ array, target: 99 });

    const foundStep = steps.find((s) => s.type === 'found');
    expect(foundStep).toBeDefined();
    expect(foundStep?.highlightedIndices).toEqual([0]);
    expect(foundStep?.counters.comparisons).toBe(1);
  });

  it('correctly handles worst case (target at last index)', () => {
    const array = [5, 10, 15, 20, 25];
    const steps = generateLinearSearchSteps({ array, target: 25 });

    const foundStep = steps.find((s) => s.type === 'found');
    expect(foundStep).toBeDefined();
    expect(foundStep?.highlightedIndices).toEqual([4]);
    expect(foundStep?.counters.comparisons).toBe(5);
  });

  it('correctly handles target not found', () => {
    const array = [1, 2, 3, 4];
    const steps = generateLinearSearchSteps({ array, target: 999 });

    const notFoundStep = steps.find((s) => s.type === 'not-found');
    expect(notFoundStep).toBeDefined();
    expect(notFoundStep?.auxiliaryState.foundIndex).toBe(-1);
    expect(notFoundStep?.counters.comparisons).toBe(4);
  });

  it('correctly handles empty array', () => {
    const steps = generateLinearSearchSteps({ array: [], target: 42 });
    expect(steps.length).toBeGreaterThan(0);
    const notFound = steps.find((s) => s.type === 'not-found');
    expect(notFound).toBeDefined();
  });

  it('guarantees immutability of array state snapshots', () => {
    const originalArray = [7, 3, 9, 1];
    const steps = generateLinearSearchSteps({ array: originalArray, target: 9 });

    for (const step of steps) {
      expect(step.state).toEqual(originalArray);
      step.state[0] = 9999;
    }

    const freshSteps = generateLinearSearchSteps({ array: originalArray, target: 9 });
    expect(freshSteps[0].state).toEqual(originalArray);
  });
});

describe('Binary Search Step Generator', () => {
  it('correctly detects unsorted array', () => {
    expect(isArraySortedAscending([10, 5, 20])).toBe(false);
    expect(isArraySortedAscending([1, 2, 3, 4, 5])).toBe(true);
    expect(isArraySortedAscending([])).toBe(true);
    expect(isArraySortedAscending([42])).toBe(true);

    const steps = generateBinarySearchSteps({ array: [30, 10, 20], target: 10 });
    expect(steps[0].auxiliaryState.isUnsorted).toBe(true);
  });

  it('correctly handles empty array', () => {
    const steps = generateBinarySearchSteps({ array: [], target: 5 });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.auxiliaryState.foundIndex).toBe(-1);
  });

  it('correctly handles single-element array (found and not found)', () => {
    // Found
    const foundSteps = generateBinarySearchSteps({ array: [42], target: 42 });
    expect(foundSteps[foundSteps.length - 1].auxiliaryState.foundIndex).toBe(0);

    // Not found
    const notFoundSteps = generateBinarySearchSteps({ array: [42], target: 99 });
    expect(notFoundSteps[notFoundSteps.length - 1].auxiliaryState.foundIndex).toBe(-1);
  });

  it('correctly handles duplicates array', () => {
    const arr = [10, 20, 20, 20, 30];
    const steps = generateBinarySearchSteps({ array: arr, target: 20 });
    const finalStep = steps[steps.length - 1];
    const foundIdx = finalStep.auxiliaryState.foundIndex;
    expect(foundIdx).not.toBeNull();
    expect(arr[foundIdx!]).toBe(20);
  });

  it('matches Array.indexOf on 200+ random sorted arrays with no input mutation', () => {
    const NUM_TRIALS = 210;

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      const len = trial === 0 ? 0 : trial === 1 ? 1 : Math.floor(Math.random() * 20) + 2;
      const sortedArray = Array.from({ length: len }, () =>
        Math.floor(Math.random() * 150)
      ).sort((a, b) => a - b);

      const originalCopy = [...sortedArray];

      // Pick target: either from array or random outside value
      const shouldExist = Math.random() > 0.3 && len > 0;
      const target = shouldExist
        ? sortedArray[Math.floor(Math.random() * len)]
        : Math.floor(Math.random() * 150);

      const steps = generateBinarySearchSteps({ array: sortedArray, target });

      // 1. Assert input array is not mutated
      expect(sortedArray).toEqual(originalCopy);

      // 2. Assert correctness
      const finalStep = steps[steps.length - 1];
      const foundIndex = finalStep.auxiliaryState.foundIndex;

      if (sortedArray.includes(target)) {
        expect(foundIndex).not.toBe(-1);
        expect(sortedArray[foundIndex!]).toBe(target);
      } else {
        expect(foundIndex).toBe(-1);
      }

      // 3. Assert replay integrity: first step state matches original input
      expect(steps[0].state).toEqual(originalCopy);
    }
  });

  it('guarantees forward-then-backward replay restores exact initial snapshot', () => {
    const array = [5, 12, 19, 24, 33, 47, 56, 78];
    const steps = generateBinarySearchSteps({ array, target: 47 });
    expect(steps.length).toBeGreaterThan(1);

    const initialSnapshot = { ...steps[0] };
    const finalSnapshot = { ...steps[steps.length - 1] };

    // Forward verification
    expect(finalSnapshot.auxiliaryState.foundIndex).toBe(5);

    // Backward verification
    let currentIdx = steps.length - 1;
    while (currentIdx > 0) {
      currentIdx--;
      expect(steps[currentIdx].state).toEqual(array);
    }
    expect(steps[currentIdx]).toEqual(initialSnapshot);
  });
});
