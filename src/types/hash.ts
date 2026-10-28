export type HashFunctionType = 'division' | 'multiplication' | 'string-poly';
export type CollisionStrategy = 'chaining' | 'linear-probing' | 'quadratic-probing';

export interface HashEntry {
  key: string | number;
  val: string | number;
  isTombstone?: boolean;
}

export type TableSlot = HashEntry | null;

export interface HashSnapshot {
  capacity: number; // m
  count: number; // n (active items)
  tombstoneCount: number;
  loadFactor: number; // n / m
  collisionStrategy: CollisionStrategy;
  hashFunction: HashFunctionType;
  table: TableSlot[];
  chains?: HashEntry[][];
  operationType: 'insert' | 'search' | 'delete' | 'rehash';
  currentKey: string | number;
  currentHash?: number;
  hashComputationExplanation?: string;
  activeSlotIndex?: number | null;
  probeSequence?: number[];
  firstTombstoneIndex?: number | null;
  foundSlotIndex?: number | null;
  isTableFull?: boolean;
  isProbeFailed?: boolean;
  isDuplicateRejected?: boolean;
  resizeRecommended?: boolean;
  rehashProgress?: {
    fromCapacity: number;
    toCapacity: number;
    currentKey?: string | number;
  };
}

export interface HashOperationInput {
  capacity: number;
  collisionStrategy: CollisionStrategy;
  hashFunction: HashFunctionType;
  initialEntries?: { key: string | number; val: string | number }[];
  initialTable?: TableSlot[];
  initialChains?: HashEntry[][];
  operation: {
    type: 'insert' | 'search' | 'delete' | 'rehash';
    key: string | number;
    val?: string | number;
    newCapacity?: number;
  };
}
