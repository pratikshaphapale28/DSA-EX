import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { SortAuxiliary } from '../../types/sorting';

const heapSortPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function heapSort(arr):', explanation: 'Start Heap Sort routine' },
  { line: 2, code: '  n = length(arr)', explanation: 'Store total array size' },
  { line: 3, code: '  // Phase 1: Build max heap from bottom-up', explanation: 'Heapify internal nodes' },
  { line: 4, code: '  for i from floor(n / 2) - 1 down to 0:', explanation: 'Start from last parent node down to root' },
  { line: 5, code: '    maxHeapify(arr, n, i)', explanation: 'Sift down node i to satisfy max-heap property' },
  { line: 6, code: '  // Phase 2: Extract maximum one by one', explanation: 'Extract root and place at end' },
  { line: 7, code: '  for i from n - 1 down to 1:', explanation: 'Iteratively reduce heap boundary' },
  { line: 8, code: '    swap(arr[0], arr[i])', explanation: 'Move current max (root) to end of array' },
  { line: 9, code: '    maxHeapify(arr, i, 0)', explanation: 'Restore max-heap on reduced heap of size i' },
  { line: 10, code: '  return arr', explanation: 'Return sorted array' },
];

const heapSortComplexity: ComplexityMetric = {
  best: 'O(N log N)',
  average: 'O(N log N)',
  worst: 'O(N log N)',
  plainEnglish: 'Guaranteed O(N log N) in all cases with O(1) auxiliary space (in-place). Building the heap takes O(N), and each of the N extractions takes O(log N).',
  space: 'O(1)',
};

export function generateHeapSortSteps(inputArray: number[]): Step<number[], SortAuxiliary>[] {
  const arr = [...inputArray];
  const steps: Step<number[], SortAuxiliary>[] = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0;
  let iterations = 0;
  let accesses = 0;

  const sortedIndices: number[] = [];

  const getHeapTree = (size: number) => {
    return arr.slice(0, size).map((val, idx) => ({ val, index: idx }));
  };

  steps.push({
    id: steps.length,
    type: 'start',
    description: `Starting Heap Sort on ${n} element(s). Phase 1: Build Max-Heap. Phase 2: Successive extractions.`,
    explanationDetail: 'Heap Sort uses a binary heap represented directly inside the array: parent at index i has children at 2i + 1 and 2i + 2.',
    codeLine: 1,
    state: [...arr],
    auxiliaryState: {
      heapSize: n,
      heapTree: getHeapTree(n),
      sortedIndices: [...sortedIndices],
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  if (n <= 1) {
    if (n === 1) sortedIndices.push(0);
    steps.push({
      id: steps.length,
      type: 'complete',
      description: 'Array is sorted trivially with 0 or 1 element.',
      codeLine: 10,
      state: [...arr],
      auxiliaryState: {
        heapSize: 0,
        heapTree: getHeapTree(0),
        sortedIndices: [...sortedIndices],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });
    return steps;
  }

  function maxHeapify(heapSize: number, rootIdx: number) {
    iterations++;
    let largest = rootIdx;
    const leftChild = 2 * rootIdx + 1;
    const rightChild = 2 * rootIdx + 2;

    accesses++;

    if (leftChild < heapSize) {
      comparisons++;
      accesses += 2;
      if (arr[leftChild] > arr[largest]) {
        largest = leftChild;
      }
    }

    if (rightChild < heapSize) {
      comparisons++;
      accesses += 2;
      if (arr[rightChild] > arr[largest]) {
        largest = rightChild;
      }
    }

    if (largest !== rootIdx) {
      const valRoot = arr[rootIdx];
      const valLargest = arr[largest];

      arr[rootIdx] = valLargest;
      arr[largest] = valRoot;
      swaps++;
      accesses += 2;

      steps.push({
        id: steps.length,
        type: 'swap',
        description: `Max-heapify: Child arr[${largest}] (${valLargest}) > parent arr[${rootIdx}] (${valRoot}). Swapped to satisfy max-heap property.`,
        explanationDetail: `Max-heap property ensures every parent node is greater than or equal to its children.`,
        codeLine: 5,
        highlightedIndices: [rootIdx, largest],
        state: [...arr],
        auxiliaryState: {
          heapSize,
          heapTree: getHeapTree(heapSize),
          pointers: [
            { label: 'parent', index: rootIdx, color: 'bg-brand-600' },
            { label: 'child', index: largest, color: 'bg-amber-600' },
          ],
          sortedIndices: [...sortedIndices],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });

      maxHeapify(heapSize, largest);
    }
  }

  // Phase 1: Build max heap
  steps.push({
    id: steps.length,
    type: 'partition',
    description: 'Phase 1: Building initial Max-Heap from the bottom-up.',
    explanationDetail: 'We start at the last parent node and sift down through every node to establish the max-heap invariant.',
    codeLine: 3,
    state: [...arr],
    auxiliaryState: {
      heapSize: n,
      heapTree: getHeapTree(n),
      sortedIndices: [...sortedIndices],
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  const startParentIdx = Math.floor(n / 2) - 1;
  for (let i = startParentIdx; i >= 0; i--) {
    maxHeapify(n, i);
  }

  steps.push({
    id: steps.length,
    type: 'visit',
    description: `Phase 1 complete! Max-Heap built. Root at index 0 holds maximum value: ${arr[0]}.`,
    explanationDetail: 'Now we enter Phase 2: extracting the root element repeatedly and placing it at the end.',
    codeLine: 6,
    highlightedIndices: [0],
    state: [...arr],
    auxiliaryState: {
      heapSize: n,
      heapTree: getHeapTree(n),
      pointers: [{ label: 'max', index: 0, color: 'bg-rose-600' }],
      sortedIndices: [...sortedIndices],
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  // Phase 2: Extraction
  for (let i = n - 1; i > 0; i--) {
    // Swap root (max) with arr[i]
    const rootVal = arr[0];
    const endVal = arr[i];
    arr[0] = endVal;
    arr[i] = rootVal;
    swaps++;
    accesses += 2;

    sortedIndices.push(i);

    steps.push({
      id: steps.length,
      type: 'swap',
      description: `Phase 2: Extracted root max element (${rootVal}) to permanent position index ${i}. Reduced heap size to ${i}.`,
      explanationDetail: `The largest remaining item is now locked into position ${i}.`,
      codeLine: 8,
      highlightedIndices: [0, i],
      state: [...arr],
      auxiliaryState: {
        heapSize: i,
        heapTree: getHeapTree(i),
        pointers: [
          { label: 'sorted', index: i, color: 'bg-emerald-600' },
          { label: 'newRoot', index: 0, color: 'bg-amber-600' },
        ],
        sortedIndices: [...sortedIndices],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });

    // Heapify the root on reduced heap
    maxHeapify(i, 0);
  }

  sortedIndices.push(0);

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `Heap Sort complete! Extracted all elements into sorted order. Total comparisons: ${comparisons}, swaps: ${swaps}.`,
    explanationDetail: 'Notice that Heap Sort sorts in-place using O(1) auxiliary space, unlike Merge Sort.',
    codeLine: 10,
    state: [...arr],
    auxiliaryState: {
      heapSize: 0,
      heapTree: getHeapTree(0),
      sortedIndices: Array.from({ length: n }, (_, k) => k),
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  return steps;
}

export const heapSortAlgorithm: AlgorithmDefinition<number[], number[], SortAuxiliary> = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  description: 'Converts array into a Max-Heap, then repeatedly extracts the maximum root to the end of the array.',
  realWorldAnalogy: 'A priority queue or emergency room triage: highest priority (largest) patient is attended first.',
  complexity: heapSortComplexity,
  pseudocode: heapSortPseudocode,
  generateSteps: generateHeapSortSteps,
  defaultInput: [35, 12, 48, 20, 9, 64, 27],
};
