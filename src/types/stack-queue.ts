export type StackQueueMode = 'stack' | 'queue' | 'circular-queue' | 'parentheses';

export interface StackQueueSnapshot {
  mode: StackQueueMode;
  items: (number | string | null)[];
  capacity: number;
  topIndex?: number;              // For stack (-1 if empty)
  frontIndex?: number;            // For queue / circular queue
  rearIndex?: number;             // For queue / circular queue
  count: number;                  // Number of active items
  isOverflow: boolean;
  isUnderflow: boolean;
  statusMessage?: string;
  peekValue?: number | string | null;
  lastActionVal?: number | string | null;
  // For Parentheses demo
  charIndex?: number;
  charStream?: string[];
  isMatchFailure?: boolean;
}

export type StackOp =
  | { type: 'push'; val: number }
  | { type: 'pop' }
  | { type: 'peek' };

export type QueueOp =
  | { type: 'enqueue'; val: number }
  | { type: 'dequeue' }
  | { type: 'front' };

export type CircularQueueOp =
  | { type: 'enqueue'; val: number }
  | { type: 'dequeue' };
