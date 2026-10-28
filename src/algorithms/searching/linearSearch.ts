import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';

export interface SearchInput {
  array: number[];
  target: number;
}

export interface SearchAuxiliary {
  target: number;
  foundIndex: number | null;
  pointer: number;
}

const linearSearchPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function linearSearch(arr, target):', explanation: 'Define search function' },
  { line: 2, code: '  for i from 0 to length(arr) - 1:', explanation: 'Iterate through each element sequentially' },
  { line: 3, code: '    if arr[i] == target:', explanation: 'Check if current item matches target' },
  { line: 4, code: '      return i // Found at index i', explanation: 'Return index immediately when target is found' },
  { line: 5, code: '  return -1 // Not found', explanation: 'If loop finishes without a match, element is absent' },
];

const linearSearchComplexity: ComplexityMetric = {
  best: 'O(1)',
  average: 'O(N)',
  worst: 'O(N)',
  plainEnglish: 'In the best case, the target is at index 0. In average and worst cases, we must inspect every single element sequentially.',
  space: 'O(1)',
};

export function generateLinearSearchSteps(input: SearchInput): Step<number[], SearchAuxiliary>[] {
  const { array, target } = input;
  const steps: Step<number[], SearchAuxiliary>[] = [];

  let comparisons = 0;
  let accesses = 0;
  let iterations = 0;

  // Step 0: Start
  steps.push({
    id: steps.length,
    type: 'start',
    description: `Starting Linear Search for target value ${target} in an array of ${array.length} items.`,
    explanationDetail: 'Linear search inspects elements one-by-one from left to right until the target is found or the end is reached.',
    codeLine: 1,
    state: [...array],
    auxiliaryState: { target, foundIndex: null, pointer: 0 },
    counters: { comparisons, swaps: 0, iterations, accesses },
  });

  let foundIndex: number | null = null;

  for (let i = 0; i < array.length; i++) {
    iterations++;
    accesses++;
    comparisons++;

    // Step: Compare arr[i] with target
    const currentVal = array[i];
    const isMatch = currentVal === target;

    steps.push({
      id: steps.length,
      type: 'compare',
      description: `Inspecting index ${i}: comparing array element ${currentVal} with target ${target}.`,
      explanationDetail: isMatch
        ? `Found a match! Value ${currentVal} matches target ${target}.`
        : `Value ${currentVal} != ${target}. Advancing to the next element.`,
      codeLine: 3,
      highlightedIndices: [i],
      state: [...array],
      auxiliaryState: { target, foundIndex: null, pointer: i },
      counters: { comparisons, swaps: 0, iterations, accesses },
    });

    if (isMatch) {
      foundIndex = i;
      steps.push({
        id: steps.length,
        type: 'found',
        description: `Target ${target} successfully found at index ${i}!`,
        explanationDetail: 'Search terminates early because the element was located.',
        codeLine: 4,
        highlightedIndices: [i],
        state: [...array],
        auxiliaryState: { target, foundIndex: i, pointer: i },
        counters: { comparisons, swaps: 0, iterations, accesses },
      });
      break;
    }
  }

  if (foundIndex === null) {
    steps.push({
      id: steps.length,
      type: 'not-found',
      description: `Reached the end of the array. Target value ${target} was not found (returns -1).`,
      explanationDetail: 'All array elements were checked, confirming the target is not present in this dataset.',
      codeLine: 5,
      state: [...array],
      auxiliaryState: { target, foundIndex: -1, pointer: array.length },
      counters: { comparisons, swaps: 0, iterations, accesses },
    });
  }

  // Completion Step
  steps.push({
    id: steps.length,
    type: 'complete',
    description: foundIndex !== null
      ? `Execution complete: target ${target} found at index ${foundIndex} after ${comparisons} comparison(s).`
      : `Execution complete: searched all ${array.length} items without finding ${target}.`,
    explanationDetail: 'Total time taken is proportional to the number of comparisons.',
    codeLine: foundIndex !== null ? 4 : 5,
    highlightedIndices: foundIndex !== null ? [foundIndex] : [],
    state: [...array],
    auxiliaryState: { target, foundIndex, pointer: foundIndex !== null ? foundIndex : array.length },
    counters: { comparisons, swaps: 0, iterations, accesses },
  });

  return steps;
}

export const linearSearchAlgorithm: AlgorithmDefinition<SearchInput, number[], SearchAuxiliary> = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
  realWorldAnalogy: 'Flipping through a stack of unsorted papers one by one until you find the matching sheet.',
  complexity: linearSearchComplexity,
  pseudocode: linearSearchPseudocode,
  generateSteps: generateLinearSearchSteps,
  defaultInput: {
    array: [14, 38, 22, 65, 8, 49, 73, 31],
    target: 49,
  },
  sampleInputs: [
    { label: 'Target Present (Middle)', input: { array: [14, 38, 22, 65, 8, 49, 73, 31], target: 49 } },
    { label: 'Best Case (First Element)', input: { array: [99, 12, 45, 67, 34, 88], target: 99 } },
    { label: 'Worst Case (Last Element)', input: { array: [10, 20, 30, 40, 50, 60, 70], target: 70 } },
    { label: 'Not Found', input: { array: [15, 25, 35, 45, 55], target: 99 } },
  ],
};
