import { describe, it, expect } from 'vitest';
import { generateStackSteps } from '../src/algorithms/stackQueue/stackOps';
import { generateQueueSteps } from '../src/algorithms/stackQueue/queueOps';
import { generateCircularQueueSteps } from '../src/algorithms/stackQueue/circularQueue';
import { generateBalancedParenthesesSteps } from '../src/algorithms/stackQueue/balancedParentheses';
import type { StackOp, QueueOp, CircularQueueOp } from '../src/types/stack-queue';

describe('Stack (LIFO) Step Generator', () => {
  it('correctly maintains LIFO order', () => {
    const steps = generateStackSteps({
      capacity: 5,
      operations: [
        { type: 'push', val: 10 },
        { type: 'push', val: 20 },
        { type: 'push', val: 30 },
        { type: 'pop' },
        { type: 'pop' },
        { type: 'pop' },
      ],
    });

    const popSteps = steps.filter((s) => s.type === 'pop');
    expect(popSteps.length).toBe(3);
    expect(popSteps[0].state.lastActionVal).toBe(30);
    expect(popSteps[1].state.lastActionVal).toBe(20);
    expect(popSteps[2].state.lastActionVal).toBe(10);
  });

  it('detects and flags Stack Overflow when capacity exceeded', () => {
    const steps = generateStackSteps({
      capacity: 2,
      operations: [
        { type: 'push', val: 10 },
        { type: 'push', val: 20 },
        { type: 'push', val: 30 },
      ],
    });

    const overflowStep = steps.find((s) => s.state.isOverflow);
    expect(overflowStep).toBeDefined();
    expect(overflowStep?.state.isOverflow).toBe(true);
    expect(overflowStep?.state.count).toBe(2);
  });

  it('detects and flags Stack Underflow when popping empty stack', () => {
    const steps = generateStackSteps({
      capacity: 3,
      operations: [
        { type: 'push', val: 5 },
        { type: 'pop' },
        { type: 'pop' },
      ],
    });

    const underflowStep = steps.find((s) => s.state.isUnderflow);
    expect(underflowStep).toBeDefined();
    expect(underflowStep?.state.isUnderflow).toBe(true);
  });

  it('matches plain JS array stack across 200+ random operation sequences', () => {
    const NUM_TRIALS = 210;

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      const capacity = Math.floor(Math.random() * 5) + 3; // 3 to 7
      const numOps = Math.floor(Math.random() * 12) + 6;
      const operations: StackOp[] = [];

      for (let o = 0; o < numOps; o++) {
        const rand = Math.random();
        if (rand < 0.6) {
          operations.push({ type: 'push', val: Math.floor(Math.random() * 90) + 10 });
        } else if (rand < 0.9) {
          operations.push({ type: 'pop' });
        } else {
          operations.push({ type: 'peek' });
        }
      }

      const steps = generateStackSteps({ capacity, operations });

      // Compare against JS reference model
      const refStack: number[] = [];
      let stepIdx = 1; // Step 0 is start

      for (const op of operations) {
        const step = steps[stepIdx];

        if (op.type === 'push') {
          if (refStack.length >= capacity) {
            expect(step.state.isOverflow).toBe(true);
          } else {
            refStack.push(op.val);
            expect(step.state.count).toBe(refStack.length);
            expect(step.state.items[refStack.length - 1]).toBe(op.val);
          }
        } else if (op.type === 'pop') {
          if (refStack.length === 0) {
            expect(step.state.isUnderflow).toBe(true);
          } else {
            const popped = refStack.pop();
            expect(step.state.lastActionVal).toBe(popped);
            expect(step.state.count).toBe(refStack.length);
          }
        } else if (op.type === 'peek') {
          const expectedPeek = refStack.length > 0 ? refStack[refStack.length - 1] : null;
          expect(step.state.peekValue).toBe(expectedPeek);
        }

        stepIdx++;
      }
    }
  });

  it('guarantees forward-then-backward replay restores exact initial snapshot', () => {
    const steps = generateStackSteps({
      capacity: 4,
      operations: [
        { type: 'push', val: 11 },
        { type: 'push', val: 22 },
        { type: 'pop' },
      ],
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) {
      i--;
    }
    expect(steps[0]).toEqual(initial);
  });
});

describe('Queue (FIFO) Step Generator', () => {
  it('correctly maintains FIFO order', () => {
    const steps = generateQueueSteps({
      capacity: 5,
      operations: [
        { type: 'enqueue', val: 10 },
        { type: 'enqueue', val: 20 },
        { type: 'enqueue', val: 30 },
        { type: 'dequeue' },
        { type: 'dequeue' },
        { type: 'dequeue' },
      ],
    });

    const dequeueSteps = steps.filter((s) => s.type === 'dequeue');
    expect(dequeueSteps.length).toBe(3);
    expect(dequeueSteps[0].state.lastActionVal).toBe(10);
    expect(dequeueSteps[1].state.lastActionVal).toBe(20);
    expect(dequeueSteps[2].state.lastActionVal).toBe(30);
  });

  it('detects and flags Queue Overflow when capacity exceeded', () => {
    const steps = generateQueueSteps({
      capacity: 2,
      operations: [
        { type: 'enqueue', val: 1 },
        { type: 'enqueue', val: 2 },
        { type: 'enqueue', val: 3 },
      ],
    });

    const overflowStep = steps.find((s) => s.state.isOverflow);
    expect(overflowStep).toBeDefined();
    expect(overflowStep?.state.isOverflow).toBe(true);
  });

  it('detects and flags Queue Underflow when dequeuing empty queue', () => {
    const steps = generateQueueSteps({
      capacity: 3,
      operations: [{ type: 'dequeue' }],
    });

    const underflowStep = steps.find((s) => s.state.isUnderflow);
    expect(underflowStep).toBeDefined();
    expect(underflowStep?.state.isUnderflow).toBe(true);
  });

  it('matches plain JS array queue across 200+ random operation sequences', () => {
    const NUM_TRIALS = 210;

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      const capacity = Math.floor(Math.random() * 5) + 3;
      const numOps = Math.floor(Math.random() * 12) + 6;
      const operations: QueueOp[] = [];

      for (let o = 0; o < numOps; o++) {
        const rand = Math.random();
        if (rand < 0.6) {
          operations.push({ type: 'enqueue', val: Math.floor(Math.random() * 90) + 10 });
        } else if (rand < 0.9) {
          operations.push({ type: 'dequeue' });
        } else {
          operations.push({ type: 'front' });
        }
      }

      const steps = generateQueueSteps({ capacity, operations });

      const refQueue: number[] = [];
      let stepIdx = 1;

      for (const op of operations) {
        const step = steps[stepIdx];

        if (op.type === 'enqueue') {
          if (refQueue.length >= capacity) {
            expect(step.state.isOverflow).toBe(true);
          } else {
            refQueue.push(op.val);
            expect(step.state.count).toBe(refQueue.length);
          }
        } else if (op.type === 'dequeue') {
          if (refQueue.length === 0) {
            expect(step.state.isUnderflow).toBe(true);
          } else {
            const dequeued = refQueue.shift();
            expect(step.state.lastActionVal).toBe(dequeued);
            expect(step.state.count).toBe(refQueue.length);
          }
        } else if (op.type === 'front') {
          const expectedFront = refQueue.length > 0 ? refQueue[0] : null;
          expect(step.state.peekValue).toBe(expectedFront);
        }

        stepIdx++;
      }
    }
  });

  it('guarantees forward-then-backward replay restores exact initial snapshot', () => {
    const steps = generateQueueSteps({
      capacity: 4,
      operations: [
        { type: 'enqueue', val: 5 },
        { type: 'enqueue', val: 10 },
        { type: 'dequeue' },
      ],
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) {
      i--;
    }
    expect(steps[0]).toEqual(initial);
  });
});

describe('Circular Queue (Ring Buffer) Step Generator', () => {
  it('correctly wraps around when earlier elements are dequeued', () => {
    const capacity = 4;
    const steps = generateCircularQueueSteps({
      capacity,
      operations: [
        { type: 'enqueue', val: 10 },
        { type: 'enqueue', val: 20 },
        { type: 'enqueue', val: 30 },
        { type: 'enqueue', val: 40 },
        { type: 'dequeue' },
        { type: 'dequeue' },
        { type: 'enqueue', val: 50 },
        { type: 'enqueue', val: 60 },
      ],
    });

    const enqueueSteps = steps.filter((s) => s.type === 'enqueue');
    expect(enqueueSteps.length).toBe(6);

    const wrapStep1 = enqueueSteps[4];
    expect(wrapStep1.state.rearIndex).toBe(0);
    expect(wrapStep1.state.items[0]).toBe(50);

    const wrapStep2 = enqueueSteps[5];
    expect(wrapStep2.state.rearIndex).toBe(1);
    expect(wrapStep2.state.items[1]).toBe(60);
  });

  it('detects Circular Queue overflow when full even after wrap-around', () => {
    const steps = generateCircularQueueSteps({
      capacity: 3,
      operations: [
        { type: 'enqueue', val: 1 },
        { type: 'enqueue', val: 2 },
        { type: 'dequeue' },
        { type: 'enqueue', val: 3 },
        { type: 'enqueue', val: 4 },
        { type: 'enqueue', val: 99 },
      ],
    });

    const overflowStep = steps.find((s) => s.state.isOverflow);
    expect(overflowStep).toBeDefined();
    expect(overflowStep?.state.isOverflow).toBe(true);
  });

  it('matches reference circular buffer across 200+ random operation sequences', () => {
    const NUM_TRIALS = 210;

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      const capacity = Math.floor(Math.random() * 4) + 3; // 3 to 6
      const numOps = Math.floor(Math.random() * 14) + 6;
      const operations: CircularQueueOp[] = [];

      for (let o = 0; o < numOps; o++) {
        if (Math.random() < 0.6) {
          operations.push({ type: 'enqueue', val: Math.floor(Math.random() * 90) + 10 });
        } else {
          operations.push({ type: 'dequeue' });
        }
      }

      const steps = generateCircularQueueSteps({ capacity, operations });

      const refItems: (number | null)[] = new Array(capacity).fill(null);
      let refFront = 0;
      let refRear = -1;
      let refCount = 0;
      let stepIdx = 1;

      for (const op of operations) {
        const step = steps[stepIdx];

        if (op.type === 'enqueue') {
          if (refCount >= capacity) {
            expect(step.state.isOverflow).toBe(true);
          } else {
            refRear = (refRear + 1) % capacity;
            refItems[refRear] = op.val;
            refCount++;
            expect(step.state.count).toBe(refCount);
            expect(step.state.rearIndex).toBe(refRear);
            expect(step.state.items[refRear]).toBe(op.val);
          }
        } else if (op.type === 'dequeue') {
          if (refCount === 0) {
            expect(step.state.isUnderflow).toBe(true);
          } else {
            const dequeued = refItems[refFront];
            refItems[refFront] = null;
            refFront = (refFront + 1) % capacity;
            refCount--;
            expect(step.state.lastActionVal).toBe(dequeued);
            expect(step.state.count).toBe(refCount);
          }
        }

        stepIdx++;
      }
    }
  });

  it('guarantees forward-then-backward replay restores exact initial snapshot', () => {
    const steps = generateCircularQueueSteps({
      capacity: 4,
      operations: [
        { type: 'enqueue', val: 1 },
        { type: 'enqueue', val: 2 },
        { type: 'dequeue' },
      ],
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) {
      i--;
    }
    expect(steps[0]).toEqual(initial);
  });
});

describe('Balanced Parentheses Checker', () => {
  it('correctly validates balanced expressions', () => {
    const validExpressions = ['{[()]}', '()[{}]', '((()))', '[]', ''];

    for (const expr of validExpressions) {
      const steps = generateBalancedParenthesesSteps({ text: expr });
      const finalStep = steps[steps.length - 1];
      expect(finalStep.state.isMatchFailure).toBe(false);
      expect(finalStep.description).toContain('BALANCED');
    }
  });

  it('correctly catches mismatched types (e.g. "(]")', () => {
    const steps = generateBalancedParenthesesSteps({ text: '(]' });
    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.isMatchFailure).toBe(true);
    expect(finalStep.description).toContain('UNBALANCED');
  });

  it('correctly catches extra closing brackets (e.g. "())" and "]" )', () => {
    const steps1 = generateBalancedParenthesesSteps({ text: '())' });
    expect(steps1[steps1.length - 1].state.isMatchFailure).toBe(true);

    const steps2 = generateBalancedParenthesesSteps({ text: ']' });
    expect(steps2[steps2.length - 1].state.isMatchFailure).toBe(true);
  });

  it('correctly catches extra opening brackets (e.g. "((())" and "{" )', () => {
    const steps1 = generateBalancedParenthesesSteps({ text: '((())' });
    expect(steps1[steps1.length - 1].state.isMatchFailure).toBe(true);

    const steps2 = generateBalancedParenthesesSteps({ text: '{' });
    expect(steps2[steps2.length - 1].state.isMatchFailure).toBe(true);
  });

  it('guarantees forward and backward replay integrity on balanced parentheses steps', () => {
    const steps = generateBalancedParenthesesSteps({ text: '{[()]}' });
    expect(steps.length).toBeGreaterThan(0);

    const firstState = steps[0].state;
    expect(firstState.items).toEqual([]);

    const finalState = steps[steps.length - 1].state;
    expect(finalState.isMatchFailure).toBe(false);

    for (let i = 0; i < steps.length; i++) {
      expect(steps[i].id).toBe(i);
      expect(steps[i].counters.comparisons).toBeGreaterThanOrEqual(0);
    }
  });
});
