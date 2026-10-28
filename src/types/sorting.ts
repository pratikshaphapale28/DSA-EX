export interface SortPointer {
  label: string;
  index: number;
  color: string;
}

export interface SortAuxiliary {
  activeRange?: [number, number];       // [start, end] of active subarray
  pivotIndex?: number;                  // Quick sort pivot index
  pointers?: SortPointer[];             // Quick sort pointers i, j; Selection minIndex, etc.
  tempArray?: (number | null)[];        // Merge sort temporary array
  tempMergeRange?: [number, number];    // Merge sort merge range [left, right]
  heapSize?: number;                    // Heap sort active heap boundary
  heapTree?: { val: number; index: number }[]; // Heap sort binary tree representation
  sortedIndices?: number[];             // Sorted indices
  minCandidateIndex?: number;           // Selection sort min index
  keyElement?: number;                  // Insertion sort element being inserted
  partitionScheme?: string;             // Quick sort partition description
}
