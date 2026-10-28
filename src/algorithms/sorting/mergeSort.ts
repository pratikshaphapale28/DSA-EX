import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { SortAuxiliary } from '../../types/sorting';

const mergeSortPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function mergeSort(arr, left, right):', explanation: 'Divide-and-conquer entry' },
  { line: 2, code: '  if left >= right: return', explanation: 'Base case: single element or empty subarray' },
  { line: 3, code: '  mid = floor((left + right) / 2)', explanation: 'Find midpoint to divide into two halves' },
  { line: 4, code: '  mergeSort(arr, left, mid)', explanation: 'Recursively sort left half' },
  { line: 5, code: '  mergeSort(arr, mid + 1, right)', explanation: 'Recursively sort right half' },
  { line: 6, code: '  merge(arr, left, mid, right)', explanation: 'Merge two sorted halves using temporary array' },
  { line: 7, code: 'function merge(arr, left, mid, right):', explanation: 'Combine two sorted subarrays' },
  { line: 8, code: '  compare elements from left and right halves', explanation: 'Pick smaller element and place into temp buffer' },
  { line: 9, code: '  copy remaining elements into temp buffer', explanation: 'Append leftovers' },
  { line: 10, code: '  copy temp buffer back into arr[left..right]', explanation: 'Write merged elements back to original array' },
];

const mergeSortComplexity: ComplexityMetric = {
  best: 'O(N log N)',
  average: 'O(N log N)',
  worst: 'O(N log N)',
  plainEnglish: 'Guaranteed O(N log N) in all cases because dividing takes log N levels and merging at each level takes O(N) work. Requires O(N) extra space.',
  space: 'O(N)',
};

export function generateMergeSortSteps(inputArray: number[]): Step<number[], SortAuxiliary>[] {
  const arr = [...inputArray];
  const steps: Step<number[], SortAuxiliary>[] = [];
  const n = arr.length;

  let comparisons = 0;
  let swaps = 0; // write operations back to arr
  let iterations = 0;
  let accesses = 0;

  steps.push({
    id: steps.length,
    type: 'start',
    description: `Starting Merge Sort on ${n} element(s). Divides array recursively down to size 1, then merges sorted halves.`,
    explanationDetail: 'Merge Sort is a classic Divide-and-Conquer algorithm with guaranteed O(N log N) performance.',
    codeLine: 1,
    state: [...arr],
    auxiliaryState: {
      activeRange: [0, n - 1],
      tempArray: new Array(n).fill(null),
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  if (n <= 1) {
    steps.push({
      id: steps.length,
      type: 'complete',
      description: 'Array is sorted trivially with 0 or 1 element.',
      codeLine: 2,
      state: [...arr],
      auxiliaryState: {
        activeRange: [0, n - 1],
        tempArray: new Array(n).fill(null),
        sortedIndices: n === 1 ? [0] : [],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });
    return steps;
  }

  function merge(left: number, mid: number, right: number) {
    iterations++;
    const leftLen = mid - left + 1;
    const rightLen = right - mid;

    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    accesses += leftLen + rightLen;

    const tempSlice: (number | null)[] = [];
    let i = 0;
    let j = 0;

    steps.push({
      id: steps.length,
      type: 'partition',
      description: `Merging sorted subarrays [${left}..${mid}] (${leftArr.join(', ')}) and [${mid + 1}..${right}] (${rightArr.join(', ')}).`,
      explanationDetail: 'Both subarrays are already internally sorted. We compare their heads and pick the smaller element to build the merged result.',
      codeLine: 7,
      state: [...arr],
      auxiliaryState: {
        activeRange: [left, right],
        tempMergeRange: [left, right],
        pointers: [
          { label: 'left', index: left, color: 'bg-brand-600' },
          { label: 'mid', index: mid, color: 'bg-cyan-600' },
          { label: 'right', index: right, color: 'bg-rose-600' },
        ],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });

    while (i < leftLen && j < rightLen) {
      comparisons++;
      accesses += 2;
      const actualLeftIdx = left + i;
      const actualRightIdx = mid + 1 + j;

      const valL = leftArr[i];
      const valR = rightArr[j];

      steps.push({
        id: steps.length,
        type: 'compare',
        description: `Comparing left element ${valL} (index ${actualLeftIdx}) with right element ${valR} (index ${actualRightIdx}).`,
        explanationDetail: valL <= valR
          ? `${valL} <= ${valR}, so ${valL} enters the temporary merge buffer first.`
          : `${valR} < ${valL}, so ${valR} enters the temporary merge buffer first.`,
        codeLine: 8,
        highlightedIndices: [actualLeftIdx, actualRightIdx],
        state: [...arr],
        auxiliaryState: {
          activeRange: [left, right],
          tempMergeRange: [left, right],
          tempArray: [...tempSlice],
          pointers: [
            { label: 'L', index: actualLeftIdx, color: 'bg-brand-600' },
            { label: 'R', index: actualRightIdx, color: 'bg-rose-600' },
          ],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });

      if (valL <= valR) {
        tempSlice.push(valL);
        i++;
      } else {
        tempSlice.push(valR);
        j++;
      }
    }

    while (i < leftLen) {
      tempSlice.push(leftArr[i]);
      accesses++;
      i++;
    }

    while (j < rightLen) {
      tempSlice.push(rightArr[j]);
      accesses++;
      j++;
    }

    // Write merged elements back to arr
    for (let k = 0; k < tempSlice.length; k++) {
      const targetIdx = left + k;
      const mergedVal = tempSlice[k] as number;
      arr[targetIdx] = mergedVal;
      swaps++;
      accesses++;

      steps.push({
        id: steps.length,
        type: 'assign',
        description: `Copying merged element ${mergedVal} back into arr[${targetIdx}].`,
        explanationDetail: `Placing the sorted merge result directly back into the original array.`,
        codeLine: 10,
        highlightedIndices: [targetIdx],
        state: [...arr],
        auxiliaryState: {
          activeRange: [left, right],
          tempMergeRange: [left, right],
          pointers: [{ label: 'copied', index: targetIdx, color: 'bg-emerald-600' }],
        },
        counters: { comparisons, swaps, iterations, accesses },
      });
    }
  }

  function mergeSortHelper(left: number, right: number) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    steps.push({
      id: steps.length,
      type: 'split',
      description: `Splitting range [${left}..${right}] at mid index ${mid}: left half [${left}..${mid}], right half [${mid + 1}..${right}].`,
      explanationDetail: 'Divide step: breaks the problem into two subproblems of half the size.',
      codeLine: 3,
      state: [...arr],
      auxiliaryState: {
        activeRange: [left, right],
        pointers: [
          { label: 'left', index: left, color: 'bg-brand-600' },
          { label: 'mid', index: mid, color: 'bg-cyan-600' },
          { label: 'right', index: right, color: 'bg-rose-600' },
        ],
      },
      counters: { comparisons, swaps, iterations, accesses },
    });

    mergeSortHelper(left, mid);
    mergeSortHelper(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSortHelper(0, n - 1);

  steps.push({
    id: steps.length,
    type: 'complete',
    description: `Merge Sort complete! All subproblems merged into a single sorted array. Comparisons: ${comparisons}, writes: ${swaps}.`,
    explanationDetail: 'Notice how the recursive tree structure combines elements in O(N log N) total operations.',
    codeLine: 6,
    state: [...arr],
    auxiliaryState: {
      sortedIndices: Array.from({ length: n }, (_, k) => k),
    },
    counters: { comparisons, swaps, iterations, accesses },
  });

  return steps;
}

export const mergeSortAlgorithm: AlgorithmDefinition<number[], number[], SortAuxiliary> = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  description: 'Divide-and-conquer algorithm that recursively splits the array in half and merges the sorted halves.',
  realWorldAnalogy: 'Dividing an unsorted deck of cards among friends until each holds 1 card, then merging pairs in order.',
  complexity: mergeSortComplexity,
  pseudocode: mergeSortPseudocode,
  generateSteps: generateMergeSortSteps,
  defaultInput: [35, 12, 48, 20, 9, 64, 27],
};
