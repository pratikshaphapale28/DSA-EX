import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { StackQueueSnapshot, QueueOp } from '../../types/stack-queue';

export interface QueueInput {
  capacity: number;
  operations: QueueOp[];
}

const queuePseudocode: PseudocodeLine[] = [
  { line: 1, code: 'class Queue(capacity):', explanation: 'Fixed-capacity First-In First-Out (FIFO) queue' },
  { line: 2, code: '  function enqueue(val):', explanation: 'Insert element at the rear' },
  { line: 3, code: '    if count == capacity: throw OverflowError', explanation: 'Check if queue is completely full' },
  { line: 4, code: '    rear++; arr[rear] = val; count++', explanation: 'Advance rear pointer and store value' },
  { line: 5, code: '  function dequeue():', explanation: 'Remove and return element from the front' },
  { line: 6, code: '    if count == 0: throw UnderflowError', explanation: 'Check if queue is empty' },
  { line: 7, code: '    val = arr[front]; front++; count--; return val', explanation: 'Advance front pointer' },
  { line: 8, code: '  function front(): return arr[front]', explanation: 'Inspect element at front without removing' },
];

const queueComplexity: ComplexityMetric = {
  best: 'O(1)',
  average: 'O(1)',
  worst: 'O(1)',
  plainEnglish: 'All operations (enqueue, dequeue, front) execute in O(1) time using pointer arithmetic.',
  space: 'O(N)',
};

export function generateQueueSteps(input: QueueInput): Step<StackQueueSnapshot, Record<string, unknown>>[] {
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
    description: `Initialized empty Queue with capacity ${capacity} (FIFO: First-In, First-Out).`,
    explanationDetail: 'Elements enter at the rear (enqueue) and exit from the front (dequeue).',
    codeLine: 1,
    state: {
      mode: 'queue',
      items: [...items],
      capacity,
      frontIndex: front,
      rearIndex: rear,
      count,
      isOverflow: false,
      isUnderflow: false,
      statusMessage: 'Queue is empty (count = 0)',
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
          description: `⚠️ Queue Overflow! Cannot enqueue ${op.val}. Maximum capacity of ${capacity} elements reached.`,
          explanationDetail: 'Queue is full. Elements must be dequeued before new elements can be accepted.',
          codeLine: 3,
          state: {
            mode: 'queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count,
            isOverflow: true,
            isUnderflow: false,
            lastActionVal: op.val,
            statusMessage: `Queue Overflow: Capacity ${capacity} exceeded!`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        rear = (rear + 1);
        items[rear] = op.val;
        count++;
        accesses++;

        steps.push({
          id: steps.length,
          type: 'enqueue',
          description: `Enqueued ${op.val} at rear (index ${rear}).`,
          explanationDetail: `Rear pointer moved to index ${rear}. Active items in queue: ${count} / ${capacity}.`,
          codeLine: 4,
          highlightedIndices: [rear],
          state: {
            mode: 'queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count,
            isOverflow: false,
            isUnderflow: false,
            lastActionVal: op.val,
            peekValue: items[front],
            statusMessage: `Enqueued ${op.val} at rear (index ${rear})`,
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
          description: `⚠️ Queue Underflow! Cannot dequeue from an empty queue.`,
          explanationDetail: 'Queue contains zero elements.',
          codeLine: 6,
          state: {
            mode: 'queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count: 0,
            isOverflow: false,
            isUnderflow: true,
            statusMessage: 'Queue Underflow: Queue is empty!',
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        const dequeuedVal = items[front];
        items[front] = null;
        const oldFront = front;
        front = front + 1;
        count--;
        accesses++;

        steps.push({
          id: steps.length,
          type: 'dequeue',
          description: `Dequeued front element ${dequeuedVal} from index ${oldFront}.`,
          explanationDetail: `Front pointer advanced to index ${front}. Remaining items: ${count}.`,
          codeLine: 7,
          highlightedIndices: [oldFront],
          state: {
            mode: 'queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count,
            isOverflow: false,
            isUnderflow: false,
            lastActionVal: dequeuedVal,
            peekValue: count > 0 ? items[front] : null,
            statusMessage: `Dequeued ${dequeuedVal}`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      }
    } else if (op.type === 'front') {
      if (count === 0) {
        steps.push({
          id: steps.length,
          type: 'peek',
          description: 'Front inspected: Queue is currently empty.',
          explanationDetail: 'No front element present.',
          codeLine: 8,
          state: {
            mode: 'queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count: 0,
            isOverflow: false,
            isUnderflow: false,
            peekValue: null,
            statusMessage: 'Queue is empty',
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        const frontVal = items[front];
        accesses++;

        steps.push({
          id: steps.length,
          type: 'peek',
          description: `Front: Next element in line is ${frontVal} at index ${front}.`,
          explanationDetail: 'Inspecting the next element to be served without dequeuing it.',
          codeLine: 8,
          highlightedIndices: [front],
          state: {
            mode: 'queue',
            items: [...items],
            capacity,
            frontIndex: front,
            rearIndex: rear,
            count,
            isOverflow: false,
            isUnderflow: false,
            peekValue: frontVal,
            statusMessage: `Front item: ${frontVal}`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      }
    }
  }

  // Completion step
  steps.push({
    id: steps.length,
    type: 'complete',
    description: `All queue operations finished. Active items: ${count} / ${capacity}.`,
    explanationDetail: 'FIFO ordering ensures elements leave in the exact order they entered.',
    codeLine: 1,
    state: {
      mode: 'queue',
      items: [...items],
      capacity,
      frontIndex: front,
      rearIndex: rear,
      count,
      isOverflow: false,
      isUnderflow: false,
      peekValue: count > 0 ? items[front] : null,
      statusMessage: `Finished operations. ${count} item(s) in queue.`,
    },
    auxiliaryState: {},
    counters: { comparisons: 0, swaps: 0, iterations, accesses },
  });

  return steps;
}

export const queueAlgorithm: AlgorithmDefinition<QueueInput, StackQueueSnapshot, Record<string, unknown>> = {
  id: 'queue-ops',
  name: 'Queue (FIFO)',
  category: 'stack-queue',
  description: 'First-In First-Out data structure where elements enter at the rear and exit from the front.',
  realWorldAnalogy: 'A checkout line at a grocery store or print job spooler: first customer in line is served first.',
  complexity: queueComplexity,
  pseudocode: queuePseudocode,
  generateSteps: generateQueueSteps,
  defaultInput: {
    capacity: 6,
    operations: [
      { type: 'enqueue', val: 10 },
      { type: 'enqueue', val: 20 },
      { type: 'enqueue', val: 30 },
      { type: 'front' },
      { type: 'dequeue' },
      { type: 'enqueue', val: 40 },
    ],
  },
  sampleInputs: [
    {
      label: 'Standard Enqueue & Dequeue',
      input: {
        capacity: 5,
        operations: [
          { type: 'enqueue', val: 15 },
          { type: 'enqueue', val: 30 },
          { type: 'dequeue' },
          { type: 'enqueue', val: 45 },
          { type: 'enqueue', val: 60 },
        ],
      },
    },
    {
      label: 'Overflow Demo (Exceed Capacity)',
      input: {
        capacity: 3,
        operations: [
          { type: 'enqueue', val: 10 },
          { type: 'enqueue', val: 20 },
          { type: 'enqueue', val: 30 },
          { type: 'enqueue', val: 99 }, // Trigger overflow
        ],
      },
    },
    {
      label: 'Underflow Demo (Dequeue Empty)',
      input: {
        capacity: 4,
        operations: [
          { type: 'enqueue', val: 10 },
          { type: 'dequeue' },
          { type: 'dequeue' }, // Trigger underflow
        ],
      },
    },
  ],
};
