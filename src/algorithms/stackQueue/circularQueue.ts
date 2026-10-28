import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { StackQueueSnapshot, CircularQueueOp } from '../../types/stack-queue';

export interface CircularQueueInput {
  capacity: number;
  operations: CircularQueueOp[];
}

const circularQueuePseudocode: PseudocodeLine[] = [
  { line: 1, code: 'class CircularQueue(capacity):', explanation: 'Fixed-size ring buffer with modulo wrap-around' },
  { line: 2, code: '  function enqueue(val):', explanation: 'Insert element at (rear + 1) % capacity' },
  { line: 3, code: '    if count == capacity: throw OverflowError', explanation: 'Check if buffer is full' },
  { line: 4, code: '    rear = (rear + 1) % capacity; arr[rear] = val; count++', explanation: 'Modulo wrap-around advance' },
  { line: 5, code: '  function dequeue():', explanation: 'Remove element from front' },
  { line: 6, code: '    if count == 0: throw UnderflowError', explanation: 'Check if buffer is empty' },
  { line: 7, code: '    val = arr[front]; arr[front] = null', explanation: 'Clear current front slot' },
  { line: 8, code: '    front = (front + 1) % capacity; count--; return val', explanation: 'Modulo wrap-around advance' },
];

const circularQueueComplexity: ComplexityMetric = {
  best: 'O(1)',
  average: 'O(1)',
  worst: 'O(1)',
  plainEnglish: 'Reuses deallocated slots at the front of the array via modulo arithmetic without ever needing to shift elements.',
  space: 'O(N)',
};

export function generateCircularQueueSteps(
  input: CircularQueueInput
): Step<StackQueueSnapshot, Record<string, unknown>>[] {
  const { capacity, operations } = input;
  const steps: Step<StackQueueSnapshot, Record<string, unknown>>[] = [];

  const items: (number | string | null)[] = new Array(capacity).fill(null);
  let front = 0;
  let rear = -1;
  let count = 0;

  let accesses = 0;
  let iterations = 0;

  steps.push({
    id: steps.length,
    type: 'start',
    description: `Initialized Circular Queue (Ring Buffer) of capacity ${capacity}.`,
    explanationDetail: 'Unlike a linear queue, freed slots at the start of the array are reused when rear wraps around: (rear + 1) % capacity.',
    codeLine: 1,
    state: {
      mode: 'circular-queue',
      items: [...items],
      capacity,
      frontIndex: front,
      rearIndex: rear,
      count: 0,
      isOverflow: false,
      isUnderflow: false,
      statusMessage: `Circular buffer initialized (capacity ${capacity})`,
    },
    auxiliaryState: {},
    counters: { comparisons: 0, swaps: 0, iterations, accesses },
  });

  for (const op of operations) {
    iterations++;

    if (op.type === 'enqueue') {
      if (count >= capacity) {
        // OVERFLOW
        steps.push({
          id: steps.length,
          type: 'not-found',
          description: `⚠️ Circular Queue Overflow! Cannot enqueue ${op.val}. All ${capacity} slots are occupied.`,
          explanationDetail: 'Buffer is full (count == capacity).',
          codeLine: 3,
          state: {
            mode: 'circular-queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count,
            isOverflow: true,
            isUnderflow: false,
            lastActionVal: op.val,
            statusMessage: `Buffer full (${capacity}/${capacity})!`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        const oldRear = rear;
        rear = (rear + 1) % capacity;
        const didWrapAround = rear < oldRear;
        items[rear] = op.val;
        count++;
        accesses++;

        steps.push({
          id: steps.length,
          type: 'enqueue',
          description: didWrapAround
            ? `🔄 Wrap-Around Enqueue! rear moved from index ${oldRear} to (${oldRear} + 1) % ${capacity} = ${rear}. Placed ${op.val}.`
            : `Enqueued ${op.val} at rear (index ${rear}). Slots in use: ${count} / ${capacity}.`,
          explanationDetail: didWrapAround
            ? `Rear reached the end of the array and seamlessly wrapped around to index 0 because earlier items were dequeued!`
            : `Rear pointer advanced using modulo arithmetic: rear = (rear + 1) % ${capacity}.`,
          codeLine: 4,
          highlightedIndices: [rear],
          state: {
            mode: 'circular-queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count,
            isOverflow: false,
            isUnderflow: false,
            lastActionVal: op.val,
            statusMessage: didWrapAround
              ? `Wrapped around to index ${rear} (enqueued ${op.val})`
              : `Enqueued ${op.val} at index ${rear}`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      }
    } else if (op.type === 'dequeue') {
      if (count === 0) {
        // UNDERFLOW
        steps.push({
          id: steps.length,
          type: 'not-found',
          description: `⚠️ Circular Queue Underflow! Buffer is empty.`,
          explanationDetail: 'Cannot dequeue from an empty ring buffer.',
          codeLine: 6,
          state: {
            mode: 'circular-queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count: 0,
            isOverflow: false,
            isUnderflow: true,
            statusMessage: 'Buffer empty (count = 0)',
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        const val = items[front];
        items[front] = null;
        const oldFront = front;
        front = (front + 1) % capacity;
        const didWrapAround = front < oldFront;
        count--;
        accesses++;

        steps.push({
          id: steps.length,
          type: 'dequeue',
          description: didWrapAround
            ? `🔄 Wrap-Around Dequeue! Removed ${val} from slot ${oldFront}. front wrapped around to (${oldFront} + 1) % ${capacity} = ${front}.`
            : `Dequeued ${val} from front (index ${oldFront}). front advanced to ${front}.`,
          explanationDetail: `Freed slot ${oldFront} which can now be reused by future enqueues. Remaining items: ${count}.`,
          codeLine: 8,
          highlightedIndices: [oldFront],
          state: {
            mode: 'circular-queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count,
            isOverflow: false,
            isUnderflow: false,
            lastActionVal: val,
            statusMessage: `Dequeued ${val} from slot ${oldFront}`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      }
    }
  }

  // Complete step
  steps.push({
    id: steps.length,
    type: 'complete',
    description: `All circular queue operations completed. Active items: ${count} / ${capacity}.`,
    explanationDetail: 'Ring buffer maintains O(1) time without wasted space at the beginning of the array.',
    codeLine: 1,
    state: {
      mode: 'circular-queue',
      items: [...items],
      capacity,
      frontIndex: front,
      rearIndex: rear,
      count,
      isOverflow: false,
      isUnderflow: false,
      statusMessage: `Execution finished. ${count} active item(s).`,
    },
    auxiliaryState: {},
    counters: { comparisons: 0, swaps: 0, iterations, accesses },
  });

  return steps;
}

export const circularQueueAlgorithm: AlgorithmDefinition<
  CircularQueueInput,
  StackQueueSnapshot,
  Record<string, unknown>
> = {
  id: 'circular-queue',
  name: 'Circular Queue (Ring Buffer)',
  category: 'stack-queue',
  description: 'Fixed-size buffer connecting the end back to the beginning to prevent wasted memory space.',
  realWorldAnalogy: 'A circular sushi conveyor belt or audio playback stream buffer: audio frames are continuously written and consumed in a loop.',
  complexity: circularQueueComplexity,
  pseudocode: circularQueuePseudocode,
  generateSteps: generateCircularQueueSteps,
  defaultInput: {
    capacity: 5,
    operations: [
      { type: 'enqueue', val: 10 },
      { type: 'enqueue', val: 20 },
      { type: 'enqueue', val: 30 },
      { type: 'dequeue' },
      { type: 'dequeue' },
      { type: 'enqueue', val: 40 },
      { type: 'enqueue', val: 50 },
      { type: 'enqueue', val: 60 }, // This wraps around to index 0!
      { type: 'enqueue', val: 70 }, // This wraps around to index 1!
    ],
  },
  sampleInputs: [
    {
      label: 'Wrap-Around Demonstration',
      input: {
        capacity: 4,
        operations: [
          { type: 'enqueue', val: 10 },
          { type: 'enqueue', val: 20 },
          { type: 'enqueue', val: 30 },
          { type: 'dequeue' },
          { type: 'enqueue', val: 40 },
          { type: 'enqueue', val: 50 }, // Wraps around to 0
        ],
      },
    },
    {
      label: 'Overflow Demo',
      input: {
        capacity: 3,
        operations: [
          { type: 'enqueue', val: 1 },
          { type: 'enqueue', val: 2 },
          { type: 'enqueue', val: 3 },
          { type: 'enqueue', val: 4 }, // Overflow
        ],
      },
    },
  ],
};
