import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { SortAuxiliary } from '../../types/sorting';

const quickSortPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function quickSort(arr, low, high):', explanation: 'Start recursive Quick Sort' },
  { line: 2, code: '  if low < high:', explanation: 'Continue partitioning while subarray size > 1' },
  { line: 3, code: '    p = partition(arr, low, high)', explanation: 'Partition array and get pivot final index (Lomuto scheme)' },
  { line: 4, code: '    quickSort(arr, low, p - 1)', explanation: 'Recursively sort elements before pivot' },
  { line: 5, code: '    quickSort(arr, p + 1, high)', explanation: 'Recursively sort elements after pivot' },
  { line: 6, code: 'function partition(arr, low, high):', explanation: 'Lomuto Partition Scheme' },
  { line: 7, code: '  pivot = arr[high]; i = low - 1', explanation: 'Choose last element as pivot, i tracks <= pivot boundary' },
  { line: 8, code: '  for j from low to high - 1:', explanation: 'Scan elements comparing against pivot' },
  { line: 9, code: '    if arr[j] <= pivot: i++; swap(arr[i], arr[j])', explanation: 'Expand smaller partition and swap' },
  { line: 10, code: '  swap(arr[i + 1], arr[high]); return i + 1', explanation: 'Place pivot into its final sorted position' },
];

const quickSortComplexity: ComplexityMetric = {
  best: 'O(N log N)',
  average: 'O(N log N)',
  worst: 'O(N²)',
  plainEnglish: 'Average O(N log N) with small constant factors. Worst case O(N²) occurs when pivot is consistently the extreme min/max (e.g. already sorted array with end pivot).',
  space: 'O(log N)',
};

export function generateQuickSortSteps(inputArray: number[]): Step<number[], SortAuxiliary>[] {
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
    description: `Starting Quick Sort on ${n} element(s) using the Lomuto Partition Scheme.`,
    explanationDetail: 'Quick Sort chooses a pivot element and partitions the array so that all elements smaller than the pivot are on its left, and all larger elements are on its right.',
    codeLine: 1,
    state: [...arr],
    auxiliaryState: {
      activeRange: [0, n - 1],
      partitionScheme: 'Lomuto Partition Scheme (Pivot = arr[high])',
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
      codeLine: 2,
      state: [...arr],
      auxiliaryState: {
        activeRange: [0, n - 1],
        partitionScheme: 'Lomuto Partition Scheme',
        sortedIndices: [...sortedIndices],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });
    return steps;
  }

  function partition(low: number, high: number): number {
    iterations++;
    const pivot = arr[high];
    accesses++;
    let i = low - 1;

    steps.push({
      id: steps.length,
      type: 'partition',
      description: `Partitioning subarray [${low}..${high}]. Selected pivot = ${pivot} at index ${high} (Lomuto Scheme).`,
      explanationDetail: `We will reorder elements so that all values <= ${pivot} move to the left partition.`,
      codeLine: 7,
      highlightedIndices: [high],
      secondaryIndices: [high],
      state: [...arr],
      auxiliaryState: {
        activeRange: [low, high],
        pivotIndex: high,
        partitionScheme: 'Lomuto Partition Scheme (Pivot = arr[high])',
        pointers: [
          { label: `pivot: ${pivot}`, index: high, color: 'bg-rose-600' },
          { label: 'low', index: low, color: 'bg-brand-600' },
          { label: 'high', index: high, color: 'bg-rose-500' },
        ],
        sortedIndices: [...sortedIndices],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });

    for (let j = low; j < high; j++) {
      comparisons++;
      accesses += 2;
      const valJ = arr[j];
      const isSmallerOrEqual = valJ <= pivot;

      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing arr[${j}] (${valJ}) with pivot ${pivot} (at index ${high}).`,
        explanationDetail: isSmallerOrEqual
          ? `${valJ} <= ${pivot}, so it belongs in the left partition. Increment i and swap arr[${i + 1}] with arr[${j}].`
          : `${valJ} > ${pivot}, belongs in the right partition. Leave it in place and advance j.`,
        codeLine: 9,
        highlightedIndices: [j, high],
        secondaryIndices: [high],
        state: [...arr],
        auxiliaryState: {
          activeRange: [low, high],
          pivotIndex: high,
          partitionScheme: 'Lomuto Partition Scheme',
          pointers: [
            { label: 'pivot', index: high, color: 'bg-rose-600' },
            { label: `j = ${j}`, index: j, color: 'bg-amber-500' },
            ...(i >= low ? [{ label: `i = ${i}`, index: i, color: 'bg-brand-500' }] : []),
          ],
          sortedIndices: [...sortedIndices],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });

      if (isSmallerOrEqual) {
        i++;
        if (i !== j) {
          const valI = arr[i];
          arr[i] = valJ;
          arr[j] = valI;
          swaps++;
          accesses += 2;

          steps.push({
            id: steps.length,
            type: 'swap',
            description: `Swapped arr[${i}] (${valI}) and arr[${j}] (${valJ}) to group elements <= pivot on the left.`,
            explanationDetail: `Expanded the smaller partition to index ${i}.`,
            codeLine: 9,
            highlightedIndices: [i, j],
            secondaryIndices: [high],
            state: [...arr],
            auxiliaryState: {
              activeRange: [low, high],
              pivotIndex: high,
              partitionScheme: 'Lomuto Partition Scheme',
              pointers: [
                { label: 'pivot', index: high, color: 'bg-rose-600' },
                { label: `i = ${i}`, index: i, color: 'bg-brand-600' },
                { label: `j = ${j}`, index: j, color: 'bg-amber-600' },
              ],
              sortedIndices: [...sortedIndices],
            },
            counters: { comparisons, swaps, iterations, accesses },
          });
        }
      }
    }

    // Place pivot into final position at i + 1
    const finalPivotIdx = i + 1;
    if (finalPivotIdx !== high) {
      const temp = arr[finalPivotIdx];
      arr[finalPivotIdx] = arr[high];
      arr[high] = temp;
      swaps++;
      accesses += 2;

      steps.push({
        id: steps.length,
        type: 'swap',
        description: `Placed pivot ${pivot} into its permanent sorted index ${finalPivotIdx} by swapping with arr[${finalPivotIdx}] (${temp}).`,
        explanationDetail: `All elements to the left of index ${finalPivotIdx} are <= ${pivot}, and all elements to the right are > ${pivot}.`,
        codeLine: 10,
        highlightedIndices: [finalPivotIdx, high],
        secondaryIndices: [finalPivotIdx],
        state: [...arr],
        auxiliaryState: {
          activeRange: [low, high],
          pivotIndex: finalPivotIdx,
          partitionScheme: 'Lomuto Partition Scheme',
          pointers: [
            { label: 'sortedPivot', index: finalPivotIdx, color: 'bg-emerald-600' },
          ],
          sortedIndices: [...sortedIndices, finalPivotIdx],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });
    }

    sortedIndices.push(finalPivotIdx);
    return finalPivotIdx;
  }

  function quickSortHelper(low: number, high: number) {
    if (low < high) {
      const p = partition(low, high);
      quickSortHelper(low, p - 1);
      quickSortHelper(p + 1, high);
    } else if (low === high) {
      sortedIndices.push(low);
    }
  }

  quickSortHelper(0, n - 1);

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `Quick Sort completed! Total comparisons: ${comparisons}, swaps: ${swaps}.`,
    explanationDetail: 'All partitions resolved and elements are in non-decreasing sorted order.',
    codeLine: 1,
    state: [...arr],
    auxiliaryState: {
      partitionScheme: 'Lomuto Partition Scheme',
      sortedIndices: Array.from({ length: n }, (_, k) => k),
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  return steps;
}

export const quickSortAlgorithm: AlgorithmDefinition<number[], number[], SortAuxiliary> = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  description: 'Partitions array around a pivot element so smaller elements precede it and larger ones succeed it (Lomuto scheme).',
  realWorldAnalogy: 'Organizing books by picking one title: placing all books earlier in the alphabet on the left shelf and later ones on the right shelf.',
  complexity: quickSortComplexity,
  pseudocode: quickSortPseudocode,
  generateSteps: generateQuickSortSteps,
  defaultInput: [35, 12, 48, 20, 9, 64, 27],
};
