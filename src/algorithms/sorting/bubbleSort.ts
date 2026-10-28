import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { SortAuxiliary } from '../../types/sorting';

const bubbleSortPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function bubbleSort(arr):', explanation: 'Start bubble sort routine' },
  { line: 2, code: '  n = length(arr)', explanation: 'Store total array size' },
  { line: 3, code: '  for i from 0 to n - 2:', explanation: 'Pass i: largest elements bubble to right' },
  { line: 4, code: '    swapped = false', explanation: 'Flag to track if any elements were exchanged' },
  { line: 5, code: '    for j from 0 to n - i - 2:', explanation: 'Compare adjacent elements in unsorted partition' },
  { line: 6, code: '      if arr[j] > arr[j + 1]:', explanation: 'Compare adjacent pair (j, j+1)' },
  { line: 7, code: '        swap(arr[j], arr[j + 1])', explanation: 'Swap out-of-order adjacent elements' },
  { line: 8, code: '        swapped = true', explanation: 'Record that a swap occurred' },
  { line: 9, code: '    if not swapped: break', explanation: 'If no swaps occurred, array is already sorted!' },
  { line: 10, code: '  return arr', explanation: 'Return the fully sorted array' },
];

const bubbleSortComplexity: ComplexityMetric = {
  best: 'O(N)',
  average: 'O(N²)',
  worst: 'O(N²)',
  plainEnglish: 'Best case O(N) when array is already sorted (detects 0 swaps). Average & worst case O(N²) because every adjacent pair is compared.',
  space: 'O(1)',
};

export function generateBubbleSortSteps(inputArray: number[]): Step<number[], SortAuxiliary>[] {
  const arr = [...inputArray];
  const steps: Step<number[], SortAuxiliary>[] = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0;
  let iterations = 0;
  let accesses = 0;

  const sortedIndices: number[] = [];

  // Initial step
  steps.push({
    id: steps.length,
    type: 'start',
    description: `Starting Bubble Sort on ${n} element(s). Elements will bubble up to their correct positions.`,
    explanationDetail: 'Bubble sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
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

  for (let i = 0; i < n; i++) {
    iterations++;
    let swappedInThisPass = false;

    steps.push({
      id: steps.length,
      type: 'partition',
      description: `Starting Pass ${i + 1} (at most n-1). Unsorted range is index 0 to ${n - i - 1}.`,
      explanationDetail: `After this pass, the ${i + 1}-th largest element will bubble to index ${n - i - 1}.`,
      codeLine: 3,
      state: [...arr],
      auxiliaryState: {
        activeRange: [0, n - i - 1],
        sortedIndices: [...sortedIndices],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      accesses += 2;

      const valLeft = arr[j];
      const valRight = arr[j + 1];
      const shouldSwap = valLeft > valRight;

      // Comparison step
      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing index ${j} (${valLeft}) with index ${j + 1} (${valRight}).`,
        explanationDetail: shouldSwap
          ? `${valLeft} > ${valRight}, so they are out of order and must be swapped.`
          : `${valLeft} <= ${valRight}, so they are already in relative order.`,
        codeLine: 6,
        highlightedIndices: [j, j + 1],
        state: [...arr],
        auxiliaryState: {
          activeRange: [0, n - i - 1],
          pointers: [
            { label: 'j', index: j, color: 'bg-amber-600' },
            { label: 'j+1', index: j + 1, color: 'bg-amber-500' },
          ],
          sortedIndices: [...sortedIndices],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });

      if (shouldSwap) {
        // Swap elements
        arr[j] = valRight;
        arr[j + 1] = valLeft;
        swaps++;
        accesses += 2;
        swappedInThisPass = true;

        steps.push({
          id: steps.length,
          type: 'swap',
          description: `Swapped index ${j} and ${j + 1}: ${valLeft} moved right, ${valRight} moved left.`,
          explanationDetail: `The larger element (${valLeft}) is moving closer to its final sorted position at the right side.`,
          codeLine: 7,
          highlightedIndices: [j, j + 1],
          state: [...arr],
          auxiliaryState: {
            activeRange: [0, n - i - 1],
            pointers: [
              { label: 'swapped', index: j, color: 'bg-brand-600' },
              { label: 'swapped', index: j + 1, color: 'bg-brand-500' },
            ],
            sortedIndices: [...sortedIndices],
          },
          counters: { comparisons, swaps, iterations, accesses },
        });
      }
    }

    // Element at n - i - 1 is now permanently sorted
    sortedIndices.push(n - i - 1);

    if (!swappedInThisPass) {
      // Early exit!
      steps.push({
        id: steps.length,
        type: 'complete',
        description: `Pass ${i + 1} completed with 0 swaps! Array is already fully sorted (early exit optimization).`,
        explanationDetail: 'Because no swaps occurred during an entire pass, every adjacent pair is in ascending order.',
        codeLine: 9,
        state: [...arr],
        auxiliaryState: {
          sortedIndices: Array.from({ length: n }, (_, k) => k),
        },
        counters: { comparisons, swaps, iterations, accesses },
      });
      break;
    }
  }

  // Final step
  steps.push({
    id: steps.length,
    type: 'complete',
    description: `Bubble Sort finished! Performed ${comparisons} comparison(s) and ${swaps} swap(s).`,
    explanationDetail: 'The array is now fully sorted in non-decreasing order.',
    codeLine: 10,
    state: [...arr],
    auxiliaryState: {
      sortedIndices: Array.from({ length: n }, (_, k) => k),
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  return steps;
}

export const bubbleSortAlgorithm: AlgorithmDefinition<number[], number[], SortAuxiliary> = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  description: 'Repeatedly compares and swaps adjacent elements until the largest values bubble to the top.',
  realWorldAnalogy: 'Bubbles of different sizes in water: the largest air bubbles rise to the surface first.',
  complexity: bubbleSortComplexity,
  pseudocode: bubbleSortPseudocode,
  generateSteps: generateBubbleSortSteps,
  defaultInput: [35, 12, 48, 20, 9, 64, 27],
};
