import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { SortAuxiliary } from '../../types/sorting';

const selectionSortPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function selectionSort(arr):', explanation: 'Start selection sort routine' },
  { line: 2, code: '  n = length(arr)', explanation: 'Store total array size' },
  { line: 3, code: '  for i from 0 to n - 2:', explanation: 'Pass i: place minimum unsorted item at index i' },
  { line: 4, code: '    minIdx = i', explanation: 'Assume current position i holds minimum' },
  { line: 5, code: '    for j from i + 1 to n - 1:', explanation: 'Scan remaining unsorted items' },
  { line: 6, code: '      if arr[j] < arr[minIdx]:', explanation: 'Check if smaller item found' },
  { line: 7, code: '        minIdx = j', explanation: 'Update index of minimum element' },
  { line: 8, code: '    if minIdx != i:', explanation: 'If a smaller item was found, swap with position i' },
  { line: 9, code: '      swap(arr[i], arr[minIdx])', explanation: 'Swap minimum into position i' },
  { line: 10, code: '  return arr', explanation: 'Return fully sorted array' },
];

const selectionSortComplexity: ComplexityMetric = {
  best: 'O(N²)',
  average: 'O(N²)',
  worst: 'O(N²)',
  plainEnglish: 'Always O(N²) comparisons because it scans every unsorted item to confirm the minimum, but makes at most O(N) swaps.',
  space: 'O(1)',
};

export function generateSelectionSortSteps(inputArray: number[]): Step<number[], SortAuxiliary>[] {
  const arr = [...inputArray];
  const steps: Step<number[], SortAuxiliary>[] = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0;
  let iterations = 0;
  let accesses = 0;

  const sortedIndices: number[] = [];

  steps.push({
    id: steps.length,
    type: 'start',
    description: `Starting Selection Sort on ${n} element(s).`,
    explanationDetail: 'Selection sort divides the array into a sorted subarray on the left and an unsorted subarray on the right, repeatedly picking the smallest remaining element.',
    codeLine: 1,
    state: [...arr],
    auxiliaryState: { sortedIndices: [...sortedIndices] },
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
      auxiliaryState: { sortedIndices: [...sortedIndices] },
      counters: { comparisons, swaps, iterations, accesses },
    });
    return steps;
  }

  for (let i = 0; i < n - 1; i++) {
    iterations++;
    let minIdx = i;
    accesses++;

    steps.push({
      id: steps.length,
      type: 'partition',
      description: `Pass ${i + 1}: searching for minimum element in unsorted range [${i}..${n - 1}]. Initial min candidate is index ${i} (${arr[i]}).`,
      explanationDetail: `Index ${i} will receive the smallest element among all items to its right.`,
      codeLine: 4,
      highlightedIndices: [i],
      state: [...arr],
      auxiliaryState: {
        activeRange: [i, n - 1],
        minCandidateIndex: minIdx,
        pointers: [{ label: 'minSoFar', index: minIdx, color: 'bg-rose-600' }],
        sortedIndices: [...sortedIndices],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      accesses += 2;
      const isSmaller = arr[j] < arr[minIdx];

      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing index ${j} (${arr[j]}) with current minimum at index ${minIdx} (${arr[minIdx]}).`,
        explanationDetail: isSmaller
          ? `Found a new smaller element! ${arr[j]} < ${arr[minIdx]}, so index ${j} becomes the new min candidate.`
          : `${arr[j]} >= ${arr[minIdx]}, current minimum remains at index ${minIdx}.`,
        codeLine: 6,
        highlightedIndices: [j, minIdx],
        state: [...arr],
        auxiliaryState: {
          activeRange: [i, n - 1],
          minCandidateIndex: minIdx,
          pointers: [
            { label: 'minSoFar', index: minIdx, color: 'bg-rose-600' },
            { label: 'j', index: j, color: 'bg-amber-500' },
          ],
          sortedIndices: [...sortedIndices],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });

      if (isSmaller) {
        minIdx = j;
        steps.push({
          id: steps.length,
          type: 'assign',
          description: `Updated minimum candidate: index ${minIdx} with value ${arr[minIdx]}.`,
          explanationDetail: 'Keeping track of this index until we finish scanning the rest of the array.',
          codeLine: 7,
          highlightedIndices: [minIdx],
          state: [...arr],
          auxiliaryState: {
            activeRange: [i, n - 1],
            minCandidateIndex: minIdx,
            pointers: [{ label: 'newMin', index: minIdx, color: 'bg-rose-600' }],
            sortedIndices: [...sortedIndices],
          },
          counters: { comparisons, swaps, iterations, accesses },
        });
      }
    }

    if (minIdx !== i) {
      const valI = arr[i];
      const valMin = arr[minIdx];
      arr[i] = valMin;
      arr[minIdx] = valI;
      swaps++;
      accesses += 2;

      steps.push({
        id: steps.length,
        type: 'swap',
        description: `Swapped index ${i} (${valI}) with minimum element index ${minIdx} (${valMin}).`,
        explanationDetail: `Value ${valMin} is now in its permanent sorted position at index ${i}.`,
        codeLine: 9,
        highlightedIndices: [i, minIdx],
        state: [...arr],
        auxiliaryState: {
          activeRange: [i, n - 1],
          pointers: [
            { label: 'sorted', index: i, color: 'bg-emerald-600' },
            { label: 'oldPos', index: minIdx, color: 'bg-slate-600' },
          ],
          sortedIndices: [...sortedIndices, i],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });
    } else {
      steps.push({
        id: steps.length,
        type: 'visit',
        description: `Element at index ${i} (${arr[i]}) was already the minimum. No swap needed.`,
        explanationDetail: 'It is already in its correct sorted position.',
        codeLine: 8,
        highlightedIndices: [i],
        state: [...arr],
        auxiliaryState: {
          sortedIndices: [...sortedIndices, i],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });
    }

    sortedIndices.push(i);
  }

  // Last element is automatically sorted
  sortedIndices.push(n - 1);

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `Selection Sort finished! Total comparisons: ${comparisons}, swaps: ${swaps}.`,
    explanationDetail: 'Notice that Selection Sort made very few swaps compared to Bubble Sort.',
    codeLine: 10,
    state: [...arr],
    auxiliaryState: {
      sortedIndices: Array.from({ length: n }, (_, k) => k),
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  return steps;
}

export const selectionSortAlgorithm: AlgorithmDefinition<number[], number[], SortAuxiliary> = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  description: 'Finds the minimum element from the unsorted part and places it at the beginning, repeating for each position.',
  realWorldAnalogy: 'Selecting the shortest person in a line and having them step to the front, repeating for each spot.',
  complexity: selectionSortComplexity,
  pseudocode: selectionSortPseudocode,
  generateSteps: generateSelectionSortSteps,
  defaultInput: [35, 12, 48, 20, 9, 64, 27],
};
