import { describe, it, expect } from 'vitest';
import { generateBubbleSortSteps } from '../src/algorithms/sorting/bubbleSort';
import { generateSelectionSortSteps } from '../src/algorithms/sorting/selectionSort';
import { generateInsertionSortSteps } from '../src/algorithms/sorting/insertionSort';
import { generateMergeSortSteps } from '../src/algorithms/sorting/mergeSort';
import { generateQuickSortSteps } from '../src/algorithms/sorting/quickSort';
import { generateHeapSortSteps } from '../src/algorithms/sorting/heapSort';
import type { Step } from '../src/types/algorithm';
import type { SortAuxiliary } from '../src/types/sorting';

type SortGenerator = (arr: number[]) => Step<number[], SortAuxiliary>[];

const algorithms: { name: string; generator: SortGenerator }[] = [
  { name: 'Bubble Sort', generator: generateBubbleSortSteps },
  { name: 'Selection Sort', generator: generateSelectionSortSteps },
  { name: 'Insertion Sort', generator: generateInsertionSortSteps },
  { name: 'Merge Sort', generator: generateMergeSortSteps },
  { name: 'Quick Sort', generator: generateQuickSortSteps },
  { name: 'Heap Sort', generator: generateHeapSortSteps },
];

describe('Sorting Algorithms - Rigorous Verification Suite', () => {
  algorithms.forEach(({ name, generator }) => {
    describe(`${name}`, () => {
      // 1. Edge Case Tests
      it('correctly handles empty array', () => {
        const input: number[] = [];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy); // Assert no mutation
        expect(steps.length).toBeGreaterThan(0);
        const finalState = steps[steps.length - 1].state;
        expect(finalState).toEqual([]);
      });

      it('correctly handles single-element array', () => {
        const input = [42];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy);
        expect(steps[steps.length - 1].state).toEqual([42]);
      });

      it('correctly handles two elements in order', () => {
        const input = [10, 20];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy);
        expect(steps[steps.length - 1].state).toEqual([10, 20]);
      });

      it('correctly handles two elements reversed', () => {
        const input = [20, 10];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy);
        expect(steps[steps.length - 1].state).toEqual([10, 20]);
      });

      it('correctly handles all duplicate elements', () => {
        const input = [7, 7, 7, 7, 7];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy);
        expect(steps[steps.length - 1].state).toEqual([7, 7, 7, 7, 7]);
      });

      it('correctly handles already sorted array', () => {
        const input = [1, 2, 3, 4, 5, 6, 7];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy);
        expect(steps[steps.length - 1].state).toEqual([1, 2, 3, 4, 5, 6, 7]);
      });

      it('correctly handles reverse sorted array', () => {
        const input = [9, 8, 7, 6, 5, 4, 3, 2, 1];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy);
        expect(steps[steps.length - 1].state).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });

      it('correctly handles negative and positive numbers with zeros', () => {
        const input = [-15, 42, 0, -3, 88, -100, 0, 17];
        const copy = [...input];
        const steps = generator(input);
        expect(input).toEqual(copy);
        const expected = [...copy].sort((a, b) => a - b);
        expect(steps[steps.length - 1].state).toEqual(expected);
      });

      // 2. 200+ Random Array Correctness & Immutability Test
      it('matches Array.prototype.sort on 200+ random arrays with zero input mutations', () => {
        const NUM_TRIALS = 210;

        for (let trial = 0; trial < NUM_TRIALS; trial++) {
          const length = trial === 0 ? 0 : trial === 1 ? 1 : Math.floor(Math.random() * 25) + 2;
          const randomArray = Array.from({ length }, () =>
            Math.floor(Math.random() * 200) - 50
          );
          const originalCopy = [...randomArray];
          const expectedSorted = [...randomArray].sort((a, b) => a - b);

          const steps = generator(randomArray);

          // 1. Assert input array was never mutated
          expect(randomArray).toEqual(originalCopy);

          // 2. Assert final step state is fully sorted
          const finalState = steps[steps.length - 1].state;
          expect(finalState).toEqual(expectedSorted);

          // 3. Assert step counters consistency: non-decreasing and valid
          let prevComp = 0;
          let prevSwaps = 0;
          for (const step of steps) {
            expect(step.counters.comparisons).toBeGreaterThanOrEqual(prevComp);
            expect(step.counters.swaps).toBeGreaterThanOrEqual(prevSwaps);
            prevComp = step.counters.comparisons;
            prevSwaps = step.counters.swaps;
          }

          // 4. Assert step time-travel integrity: first step matches original input
          expect(steps[0].state).toEqual(originalCopy);
        }
      });
    });
  });
});
