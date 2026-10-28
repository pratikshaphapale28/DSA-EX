import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { SortAuxiliary } from '../../types/sorting';

const insertionSortPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function insertionSort(arr):', explanation: 'Start insertion sort routine' },
  { line: 2, code: '  for i from 1 to length(arr) - 1:', explanation: 'Pick item at index i to insert into sorted left partition' },
  { line: 3, code: '    key = arr[i]', explanation: 'Store current item as key' },
  { line: 4, code: '    j = i - 1', explanation: 'Start comparing with item immediately to the left' },
  { line: 5, code: '    while j >= 0 and arr[j] > key:', explanation: 'Shift larger elements to the right' },
  { line: 6, code: '      arr[j + 1] = arr[j]', explanation: 'Shift element one position right' },
  { line: 7, code: '      j = j - 1', explanation: 'Move one index left' },
  { line: 8, code: '    arr[j + 1] = key', explanation: 'Insert key into vacant sorted position' },
  { line: 9, code: '  return arr', explanation: 'Return sorted array' },
];

const insertionSortComplexity: ComplexityMetric = {
  best: 'O(N)',
  average: 'O(N²)',
  worst: 'O(N²)',
  plainEnglish: 'Best case O(N) when array is nearly sorted (very few shifts). Worst case O(N²) for reverse order (every element shifts all the way to 0).',
  space: 'O(1)',
};

export function generateInsertionSortSteps(inputArray: number[]): Step<number[], SortAuxiliary>[] {
  const arr = [...inputArray];
  const steps: Step<number[], SortAuxiliary>[] = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0; // counted as shifts/assignments
  let iterations = 0;
  let accesses = 0;

  steps.push({
    id: steps.length,
    type: 'start',
    description: `Starting Insertion Sort on ${n} element(s). Index 0 is trivially sorted.`,
    explanationDetail: 'Like sorting playing cards in your hand: take one card at a time and insert it into its correct position among the already sorted cards.',
    codeLine: 1,
    state: [...arr],
    auxiliaryState: {
      sortedIndices: n > 0 ? [0] : [],
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  if (n <= 1) {
    steps.push({
      id: steps.length,
      type: 'complete',
      description: 'Array is sorted trivially with 0 or 1 element.',
      codeLine: 9,
      state: [...arr],
      auxiliaryState: {
        sortedIndices: n === 1 ? [0] : [],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });
    return steps;
  }

  for (let i = 1; i < n; i++) {
    iterations++;
    const key = arr[i];
    accesses++;

    steps.push({
      id: steps.length,
      type: 'partition',
      description: `Step ${i}: Selected key = ${key} at index ${i}. Inserting into sorted subarray [0..${i - 1}].`,
      explanationDetail: `We will compare ${key} backwards against each element in the sorted portion until we find where it fits.`,
      codeLine: 3,
      highlightedIndices: [i],
      state: [...arr],
      auxiliaryState: {
        activeRange: [0, i],
        keyElement: key,
        pointers: [{ label: 'key', index: i, color: 'bg-rose-600' }],
        sortedIndices: Array.from({ length: i }, (_, k) => k),
      },
      counters: { comparisons, swaps, iterations, accesses },
    });

    let j = i - 1;

    while (j >= 0) {
      comparisons++;
      accesses++;
      const valJ = arr[j];

      if (valJ > key) {
        // Shift arr[j] to arr[j+1]
        arr[j + 1] = valJ;
        swaps++;
        accesses++;

        steps.push({
          id: steps.length,
          type: 'swap',
          description: `arr[${j}] (${valJ}) > key (${key}). Shifting ${valJ} right to index ${j + 1}.`,
          explanationDetail: `Opening up space for the key element ${key}.`,
          codeLine: 6,
          highlightedIndices: [j, j + 1],
          state: [...arr],
          auxiliaryState: {
            activeRange: [0, i],
            keyElement: key,
            pointers: [
              { label: 'shift', index: j + 1, color: 'bg-brand-600' },
              { label: 'compare', index: j, color: 'bg-amber-600' },
            ],
            sortedIndices: Array.from({ length: i }, (_, k) => k),
          },
          counters: { comparisons, swaps, iterations, accesses },
        });

        j--;
      } else {
        steps.push({
          id: steps.length,
          type: 'compare',
          description: `arr[${j}] (${valJ}) <= key (${key}). Found insertion position at index ${j + 1}!`,
          explanationDetail: `Since elements before index ${j} are even smaller, ${key} belongs directly after index ${j}.`,
          codeLine: 5,
          highlightedIndices: [j],
          state: [...arr],
          auxiliaryState: {
            activeRange: [0, i],
            keyElement: key,
            pointers: [{ label: 'insertAfter', index: j, color: 'bg-emerald-600' }],
            sortedIndices: Array.from({ length: i }, (_, k) => k),
          },
          counters: { comparisons, swaps, iterations, accesses },
        });
        break;
      }
    }

    // Insert key at j + 1
    arr[j + 1] = key;
    accesses++;

    steps.push({
      id: steps.length,
      type: 'insert',
      description: `Inserted key (${key}) into vacant position at index ${j + 1}.`,
      explanationDetail: `Subarray [0..${i}] is now sorted.`,
      codeLine: 8,
      highlightedIndices: [j + 1],
      state: [...arr],
      auxiliaryState: {
        activeRange: [0, i],
        pointers: [{ label: 'inserted', index: j + 1, color: 'bg-emerald-600' }],
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      },
      counters: { comparisons, swaps, iterations, accesses },
    });
  }

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `Insertion Sort completed! Comparisons: ${comparisons}, shifts/writes: ${swaps}.`,
    explanationDetail: 'All elements have been inserted into their appropriate sorted positions.',
    codeLine: 9,
    state: [...arr],
    auxiliaryState: {
      sortedIndices: Array.from({ length: n }, (_, k) => k),
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  return steps;
}

export const insertionSortAlgorithm: AlgorithmDefinition<number[], number[], SortAuxiliary> = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  description: 'Builds the final sorted array one item at a time by inserting each into its proper place.',
  realWorldAnalogy: 'Sorting playing cards in your hand as you draw them from the deck.',
  complexity: insertionSortComplexity,
  pseudocode: insertionSortPseudocode,
  generateSteps: generateInsertionSortSteps,
  defaultInput: [35, 12, 48, 20, 9, 64, 27],
};
