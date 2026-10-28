import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { SortPointer } from '../../types/sorting';

export interface BinarySearchInput {
  array: number[];
  target: number;
}

export interface BinarySearchAuxiliary {
  target: number;
  low: number;
  mid: number;
  high: number;
  foundIndex: number | null;
  eliminatedRange?: [number, number];
  isUnsorted?: boolean;
  pointers?: SortPointer[];
}

const binarySearchPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function binarySearch(arr, target):', explanation: 'Requires array to be sorted in ascending order' },
  { line: 2, code: '  low = 0; high = length(arr) - 1', explanation: 'Initialize search boundaries covering entire array' },
  { line: 3, code: '  while low <= high:', explanation: 'Continue while search interval is non-empty' },
  { line: 4, code: '    mid = floor((low + high) / 2)', explanation: 'Inspect middle element of current interval' },
  { line: 5, code: '    if arr[mid] == target: return mid', explanation: 'Target found! Terminate search immediately' },
  { line: 6, code: '    else if arr[mid] < target: low = mid + 1', explanation: 'Target is in right half; eliminate left half [low..mid]' },
  { line: 7, code: '    else: high = mid - 1', explanation: 'Target is in left half; eliminate right half [mid..high]' },
  { line: 8, code: '  return -1 // Not found', explanation: 'Search space exhausted; target is absent' },
];

const binarySearchComplexity: ComplexityMetric = {
  best: 'O(1)',
  average: 'O(log N)',
  worst: 'O(log N)',
  plainEnglish: 'Halves the search space on every iteration. Even for 1,000,000 items, at most 20 comparisons are needed.',
  space: 'O(1)',
};

export function isArraySortedAscending(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

export function generateBinarySearchSteps(
  input: BinarySearchInput
): Step<number[], BinarySearchAuxiliary>[] {
  const { array, target } = input;
  const arr = [...array];
  const steps: Step<number[], BinarySearchAuxiliary>[] = [];
  const n = arr.length;

  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;

  const isSorted = isArraySortedAscending(arr);

  // Initial step
  steps.push({
    id: steps.length,
    type: 'start',
    description: isSorted
      ? `Starting Binary Search for target ${target} on sorted array of ${n} element(s).`
      : `⚠️ Warning: Array is unsorted! Binary Search requires sorted data to eliminate halves reliably.`,
    explanationDetail: isSorted
      ? 'Binary Search repeatedly divides the search interval in half by comparing the target with the middle element.'
      : 'Because the array is unsorted, the assumption that elements to the left of mid are smaller is violated.',
    codeLine: 1,
    state: [...arr],
    auxiliaryState: {
      target,
      low: 0,
      mid: -1,
      high: n - 1,
      foundIndex: null,
      isUnsorted: !isSorted,
    },
    counters: { comparisons, swaps: 0, iterations, accesses },
  });

  if (n === 0) {
    steps.push({
      id: steps.length,
      type: 'not-found',
      description: `Array is empty. Target ${target} cannot be found (returns -1).`,
      explanationDetail: 'Search space is empty at initialization.',
      codeLine: 8,
      state: [...arr],
      auxiliaryState: {
        target,
        low: 0,
        mid: -1,
        high: -1,
        foundIndex: -1,
        isUnsorted: !isSorted,
      },
      counters: { comparisons, swaps: 0, iterations, accesses },
    });
    return steps;
  }

  let low = 0;
  let high = n - 1;
  let foundIndex: number | null = null;

  while (low <= high) {
    iterations++;
    const mid = Math.floor((low + high) / 2);
    accesses++;
    const midVal = arr[mid];

    // Pointer helper
    const pointers: SortPointer[] = [
      { label: `Low = ${low}`, index: low, color: 'bg-brand-600' },
      { label: `Mid = ${mid}`, index: mid, color: 'bg-cyan-600' },
      { label: `High = ${high}`, index: high, color: 'bg-rose-600' },
    ];

    steps.push({
      id: steps.length,
      type: 'compare',
      description: `Search interval [${low}..${high}]. Inspecting mid index ${mid} (value ${midVal}) against target ${target}.`,
      explanationDetail: `Midpoint is calculated as floor((${low} + ${high}) / 2) = ${mid}.`,
      codeLine: 4,
      highlightedIndices: [mid],
      secondaryIndices: [low, high],
      state: [...arr],
      auxiliaryState: {
        target,
        low,
        mid,
        high,
        foundIndex: null,
        pointers,
        isUnsorted: !isSorted,
      },
      counters: { comparisons, swaps: 0, iterations, accesses },
    });

    comparisons++;
    if (midVal === target) {
      foundIndex = mid;
      steps.push({
        id: steps.length,
        type: 'found',
        description: `Target ${target} found at mid index ${mid}!`,
        explanationDetail: 'Target matched arr[mid]. Binary search terminates successfully.',
        codeLine: 5,
        highlightedIndices: [mid],
        state: [...arr],
        auxiliaryState: {
          target,
          low,
          mid,
          high,
          foundIndex: mid,
          pointers: [{ label: 'TARGET FOUND', index: mid, color: 'bg-emerald-600' }],
          isUnsorted: !isSorted,
        },
        counters: { comparisons, swaps: 0, iterations, accesses },
      });
      break;
    } else if (midVal < target) {
      comparisons++;
      // Target is greater than midVal: eliminate left half [low..mid]
      steps.push({
        id: steps.length,
        type: 'partition',
        description: `arr[mid] (${midVal}) < target (${target}). Eliminating left half [${low}..${mid}]. Updating low = ${mid + 1}.`,
        explanationDetail: `Since the array is sorted, no value at or before index ${mid} can equal ${target}.`,
        codeLine: 6,
        highlightedIndices: [mid],
        state: [...arr],
        auxiliaryState: {
          target,
          low,
          mid,
          high,
          foundIndex: null,
          eliminatedRange: [0, mid],
          pointers: [
            { label: `low -> ${mid + 1}`, index: Math.min(n - 1, mid + 1), color: 'bg-brand-600' },
            { label: `high = ${high}`, index: high, color: 'bg-rose-600' },
          ],
          isUnsorted: !isSorted,
        },
        counters: { comparisons, swaps: 0, iterations, accesses },
      });
      low = mid + 1;
    } else {
      comparisons++;
      // Target is less than midVal: eliminate right half [mid..high]
      steps.push({
        id: steps.length,
        type: 'partition',
        description: `arr[mid] (${midVal}) > target (${target}). Eliminating right half [${mid}..${high}]. Updating high = ${mid - 1}.`,
        explanationDetail: `Since the array is sorted, no value at or after index ${mid} can equal ${target}.`,
        codeLine: 7,
        highlightedIndices: [mid],
        state: [...arr],
        auxiliaryState: {
          target,
          low,
          mid,
          high,
          foundIndex: null,
          eliminatedRange: [mid, n - 1],
          pointers: [
            { label: `low = ${low}`, index: low, color: 'bg-brand-600' },
            { label: `high -> ${Math.max(0, mid - 1)}`, index: Math.max(0, mid - 1), color: 'bg-rose-600' },
          ],
          isUnsorted: !isSorted,
        },
        counters: { comparisons, swaps: 0, iterations, accesses },
      });
      high = mid - 1;
    }
  }

  if (foundIndex === null) {
    steps.push({
      id: steps.length,
      type: 'not-found',
      description: `Search interval exhausted (low > high: ${low} > ${high}). Target ${target} was not found (returns -1).`,
      explanationDetail: 'All possible positions for the target have been eliminated.',
      codeLine: 8,
      state: [...arr],
      auxiliaryState: {
        target,
        low,
        mid: -1,
        high,
        foundIndex: -1,
        eliminatedRange: [0, n - 1],
        isUnsorted: !isSorted,
      },
      counters: { comparisons, swaps: 0, iterations, accesses },
    });
  }

  steps.push({
    id: steps.length,
    type: 'complete',
    description: foundIndex !== null
      ? `Binary Search complete: target ${target} located at index ${foundIndex} in ${comparisons} comparison(s).`
      : `Binary Search complete: target ${target} is not in the array. Performed ${comparisons} comparison(s).`,
    explanationDetail: `Maximum comparisons for N=${n} is ceil(log2(${n})) = ${Math.ceil(Math.log2(Math.max(1, n)))} comparisons.`,
    codeLine: foundIndex !== null ? 5 : 8,
    highlightedIndices: foundIndex !== null ? [foundIndex] : [],
    state: [...arr],
    auxiliaryState: {
      target,
      low,
      mid: foundIndex !== null ? foundIndex : -1,
      high,
      foundIndex: foundIndex !== null ? foundIndex : -1,
      isUnsorted: !isSorted,
    },
    counters: { comparisons, swaps: 0, iterations, accesses },
  });

  return steps;
}

export const binarySearchAlgorithm: AlgorithmDefinition<
  BinarySearchInput,
  number[],
  BinarySearchAuxiliary
> = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  description: 'Efficiently searches a sorted array by repeatedly dividing the search interval in half.',
  realWorldAnalogy: 'Looking up a word in a physical dictionary: open to the middle, check if word is before or after, repeat.',
  complexity: binarySearchComplexity,
  pseudocode: binarySearchPseudocode,
  generateSteps: generateBinarySearchSteps,
  defaultInput: {
    array: [8, 14, 22, 31, 38, 49, 65, 73],
    target: 49,
  },
  sampleInputs: [
    { label: 'Target Present (Mid)', input: { array: [8, 14, 22, 31, 38, 49, 65, 73], target: 49 } },
    { label: 'Best Case (First Mid)', input: { array: [10, 20, 30, 40, 50, 60, 70], target: 40 } },
    { label: 'Target at Extremes (Right)', input: { array: [5, 15, 25, 35, 45, 55, 65], target: 65 } },
    { label: 'Target Not Found', input: { array: [10, 20, 30, 40, 50, 60], target: 25 } },
    { label: 'Unsorted Warning Demo', input: { array: [45, 12, 89, 3, 21, 67], target: 21 } },
  ],
};
