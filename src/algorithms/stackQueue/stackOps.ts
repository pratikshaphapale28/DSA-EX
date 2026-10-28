import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { StackQueueSnapshot, StackOp } from '../../types/stack-queue';

export interface StackInput {
  capacity: number;
  operations: StackOp[];
}

const stackPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'class Stack(capacity):', explanation: 'Fixed-capacity Last-In First-Out (LIFO) stack' },
  { line: 2, code: '  function push(val):', explanation: 'Add element to the top' },
  { line: 3, code: '    if top == capacity - 1: throw OverflowError', explanation: 'Check if stack is already full' },
  { line: 4, code: '    top++; arr[top] = val', explanation: 'Increment top pointer and store value' },
  { line: 5, code: '  function pop():', explanation: 'Remove and return element from the top' },
  { line: 6, code: '    if top == -1: throw UnderflowError', explanation: 'Check if stack is already empty' },
  { line: 7, code: '    val = arr[top]; top--; return val', explanation: 'Decrement top pointer' },
  { line: 8, code: '  function peek(): return arr[top]', explanation: 'Inspect top element without removing' },
];

const stackComplexity: ComplexityMetric = {
  best: 'O(1)',
  average: 'O(1)',
  worst: 'O(1)',
  plainEnglish: 'All operations (push, pop, peek) are constant time O(1) because they only manipulate the top pointer.',
  space: 'O(N)',
};

export function generateStackSteps(input: StackInput): Step<StackQueueSnapshot, Record<string, unknown>>[] {
  const { capacity, operations } = input;
  const steps: Step<StackQueueSnapshot, Record<string, unknown>>[] = [];

  const items: (number | string | null)[] = new Array(capacity).fill(null);
  let top = -1;

  let accesses = 0;
  let iterations = 0;

  // Initial step
  steps.push({
    id: steps.length,
    type: 'start',
    description: `Initialized empty Stack with capacity ${capacity} (LIFO: Last-In, First-Out).`,
    explanationDetail: 'Top pointer starts at -1 indicating an empty stack. Pushing adds to the top; popping removes from the top.',
    codeLine: 1,
    state: {
      mode: 'stack',
      items: [...items],
      capacity,
      topIndex: top,
      count: 0,
      isOverflow: false,
      isUnderflow: false,
      statusMessage: 'Stack is empty (top = -1)',
    },
    auxiliaryState: {},
    counters: { comparisons: 0, swaps: 0, iterations, accesses },
  });

  for (const op of operations) {
    iterations++;

    if (op.type === 'push') {
      if (top >= capacity - 1) {
        // OVERFLOW ERROR
        steps.push({
          id: steps.length,
          type: 'not-found',
          description: `⚠️ Stack Overflow! Cannot push ${op.val}. Maximum capacity of ${capacity} elements reached.`,
          explanationDetail: 'Stack overflow occurs when attempting to push onto a full stack without available space.',
          codeLine: 3,
          state: {
            mode: 'stack',
            items: [...items],
            capacity,
            topIndex: top,
            count: top + 1,
            isOverflow: true,
            isUnderflow: false,
            statusMessage: `Stack Overflow: Capacity ${capacity} exceeded!`,
            lastActionVal: op.val,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        top++;
        items[top] = op.val;
        accesses++;

        steps.push({
          id: steps.length,
          type: 'push',
          description: `Pushed value ${op.val} onto top of stack (index ${top}).`,
          explanationDetail: `Top pointer moved from ${top - 1} to ${top}. Stack now has ${top + 1} item(s).`,
          codeLine: 4,
          highlightedIndices: [top],
          state: {
            mode: 'stack',
            items: [...items],
            capacity,
            topIndex: top,
            count: top + 1,
            isOverflow: false,
            isUnderflow: false,
            peekValue: op.val,
            lastActionVal: op.val,
            statusMessage: `Pushed ${op.val} to top (index ${top})`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      }
    } else if (op.type === 'pop') {
      if (top === -1) {
        // UNDERFLOW ERROR
        steps.push({
          id: steps.length,
          type: 'not-found',
          description: `⚠️ Stack Underflow! Cannot pop from an empty stack.`,
          explanationDetail: 'Stack underflow occurs when attempting to pop or peek from a stack containing zero elements.',
          codeLine: 6,
          state: {
            mode: 'stack',
            items: [...items],
            capacity,
            topIndex: -1,
            count: 0,
            isOverflow: false,
            isUnderflow: true,
            statusMessage: 'Stack Underflow: Stack is empty!',
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        const poppedVal = items[top];
        items[top] = null;
        accesses++;
        top--;

        steps.push({
          id: steps.length,
          type: 'pop',
          description: `Popped top element ${poppedVal} from the stack.`,
          explanationDetail: `Top element was removed. Top pointer decremented to ${top}.`,
          codeLine: 7,
          highlightedIndices: [top + 1],
          state: {
            mode: 'stack',
            items: [...items],
            capacity,
            topIndex: top,
            count: top + 1,
            isOverflow: false,
            isUnderflow: false,
            lastActionVal: poppedVal,
            peekValue: top >= 0 ? items[top] : null,
            statusMessage: `Popped ${poppedVal}`,
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      }
    } else if (op.type === 'peek') {
      if (top === -1) {
        steps.push({
          id: steps.length,
          type: 'peek',
          description: `Peek inspected top element: Stack is currently empty (null).`,
          explanationDetail: 'Cannot peek an empty stack.',
          codeLine: 8,
          state: {
            mode: 'stack',
            items: [...items],
            capacity,
            topIndex: -1,
            count: 0,
            isOverflow: false,
            isUnderflow: false,
            peekValue: null,
            statusMessage: 'Stack is empty',
          },
          auxiliaryState: {},
          counters: { comparisons: 0, swaps: 0, iterations, accesses },
        });
      } else {
        const topVal = items[top];
        accesses++;

        steps.push({
          id: steps.length,
          type: 'peek',
          description: `Peek: Top element is ${topVal} at index ${top}. The element remains on the stack.`,
          explanationDetail: 'Peek returns the top item without mutating or removing it.',
          codeLine: 8,
          highlightedIndices: [top],
          state: {
            mode: 'stack',
            items: [...items],
            capacity,
            topIndex: top,
            count: top + 1,
            isOverflow: false,
            isUnderflow: false,
            peekValue: topVal,
            statusMessage: `Top item: ${topVal}`,
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
    description: `All stack operations completed. Current items count: ${top + 1} / ${capacity}.`,
    explanationDetail: 'LIFO structure preserved throughout all operations.',
    codeLine: 1,
    state: {
      mode: 'stack',
      items: [...items],
      capacity,
      topIndex: top,
      count: top + 1,
      isOverflow: false,
      isUnderflow: false,
      peekValue: top >= 0 ? items[top] : null,
      statusMessage: `Finished operations. ${top + 1} item(s) in stack.`,
    },
    auxiliaryState: {},
    counters: { comparisons: 0, swaps: 0, iterations, accesses },
  });

  return steps;
}

export const stackAlgorithm: AlgorithmDefinition<StackInput, StackQueueSnapshot, Record<string, unknown>> = {
  id: 'stack-ops',
  name: 'Stack (LIFO)',
  category: 'stack-queue',
  description: 'Last-In First-Out data structure with constant-time push, pop, and peek operations.',
  realWorldAnalogy: 'A stack of dining plates or browser history back-button: the last plate added is the first one taken off.',
  complexity: stackComplexity,
  pseudocode: stackPseudocode,
  generateSteps: generateStackSteps,
  defaultInput: {
    capacity: 6,
    operations: [
      { type: 'push', val: 10 },
      { type: 'push', val: 20 },
      { type: 'push', val: 30 },
      { type: 'peek' },
      { type: 'pop' },
      { type: 'push', val: 40 },
    ],
  },
  sampleInputs: [
    {
      label: 'Standard Push & Pop',
      input: {
        capacity: 5,
        operations: [
          { type: 'push', val: 12 },
          { type: 'push', val: 24 },
          { type: 'push', val: 36 },
          { type: 'pop' },
          { type: 'push', val: 48 },
        ],
      },
    },
    {
      label: 'Overflow Demo (Exceed Capacity)',
      input: {
        capacity: 3,
        operations: [
          { type: 'push', val: 10 },
          { type: 'push', val: 20 },
          { type: 'push', val: 30 },
          { type: 'push', val: 99 }, // Trigger overflow
        ],
      },
    },
    {
      label: 'Underflow Demo (Pop Empty)',
      input: {
        capacity: 4,
        operations: [
          { type: 'push', val: 5 },
          { type: 'pop' },
          { type: 'pop' }, // Trigger underflow
        ],
      },
    },
  ],
};
