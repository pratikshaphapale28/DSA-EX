import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../src/engine/usePlayerStore';
import type { Step } from '../src/types/algorithm';

describe('Player Engine & Snapshot Store', () => {
  const dummySteps: Step<number[]>[] = [
    {
      id: 0,
      type: 'start',
      description: 'Initial state',
      codeLine: 1,
      state: [30, 10, 20],
      auxiliaryState: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, accesses: 0 },
    },
    {
      id: 1,
      type: 'compare',
      description: 'Comparing index 0 and 1',
      codeLine: 2,
      highlightedIndices: [0, 1],
      state: [30, 10, 20],
      auxiliaryState: {},
      counters: { comparisons: 1, swaps: 0, iterations: 1, accesses: 2 },
    },
    {
      id: 2,
      type: 'swap',
      description: 'Swapped index 0 and 1',
      codeLine: 3,
      highlightedIndices: [0, 1],
      state: [10, 30, 20],
      auxiliaryState: {},
      counters: { comparisons: 1, swaps: 1, iterations: 1, accesses: 4 },
    },
    {
      id: 3,
      type: 'compare',
      description: 'Comparing index 1 and 2',
      codeLine: 2,
      highlightedIndices: [1, 2],
      state: [10, 30, 20],
      auxiliaryState: {},
      counters: { comparisons: 2, swaps: 1, iterations: 2, accesses: 6 },
    },
    {
      id: 4,
      type: 'complete',
      description: 'Execution complete',
      codeLine: 4,
      state: [10, 20, 30],
      auxiliaryState: {},
      counters: { comparisons: 2, swaps: 1, iterations: 2, accesses: 6 },
    },
  ];

  beforeEach(() => {
    usePlayerStore.getState().setSteps(dummySteps);
  });

  it('initializes at step 0 in paused state', () => {
    const store = usePlayerStore.getState();
    expect(store.currentStepIndex).toBe(0);
    expect(store.isPlaying).toBe(false);
    expect(store.getCurrentStep()?.id).toBe(0);
    expect(store.getIsAtStart()).toBe(true);
    expect(store.getIsAtEnd()).toBe(false);
  });

  it('steps forward correctly', () => {
    const store = usePlayerStore.getState();
    store.nextStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(1);
    expect(usePlayerStore.getState().getCurrentStep()?.description).toBe('Comparing index 0 and 1');

    store.nextStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(2);

    store.nextStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(3);

    store.nextStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(4);
    expect(usePlayerStore.getState().getIsAtEnd()).toBe(true);

    // Stepping past end keeps index bounded
    store.nextStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(4);
  });

  it('steps backward correctly (step-back time travel)', () => {
    const store = usePlayerStore.getState();
    store.goToStep(4);
    expect(usePlayerStore.getState().currentStepIndex).toBe(4);

    store.prevStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(3);
    expect(usePlayerStore.getState().getCurrentStep()?.id).toBe(3);

    store.prevStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(2);

    store.prevStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(1);

    store.prevStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(0);
    expect(usePlayerStore.getState().getIsAtStart()).toBe(true);

    // Stepping before start keeps index at 0
    store.prevStep();
    expect(usePlayerStore.getState().currentStepIndex).toBe(0);
  });

  it('replaying steps forward then backward restores the exact original state', () => {
    const store = usePlayerStore.getState();
    const originalState = [...usePlayerStore.getState().getCurrentStep()!.state];

    // Play all the way forward
    while (!usePlayerStore.getState().getIsAtEnd()) {
      store.nextStep();
    }
    expect(usePlayerStore.getState().getCurrentStep()?.state).toEqual([10, 20, 30]);

    // Play all the way backward
    while (!usePlayerStore.getState().getIsAtStart()) {
      store.prevStep();
    }

    // Must match exact original state
    expect(usePlayerStore.getState().getCurrentStep()?.state).toEqual(originalState);
    expect(usePlayerStore.getState().currentStepIndex).toBe(0);
  });

  it('displayed counters equal counts derived from the recorded steps', () => {
    const store = usePlayerStore.getState();

    // Verify at each step that the stored counters match step events
    for (let i = 0; i < dummySteps.length; i++) {
      store.goToStep(i);
      const step = usePlayerStore.getState().getCurrentStep()!;

      // Derive counts directly from recorded steps up to index i
      const derivedComparisons = dummySteps
        .slice(0, i + 1)
        .filter((s) => s.type === 'compare').length;

      const derivedSwaps = dummySteps
        .slice(0, i + 1)
        .filter((s) => s.type === 'swap').length;

      expect(step.counters.comparisons).toBe(derivedComparisons);
      expect(step.counters.swaps).toBe(derivedSwaps);
    }
  });

  it('jumps directly via timeline slider index', () => {
    const store = usePlayerStore.getState();
    store.goToStep(1);
    expect(usePlayerStore.getState().currentStepIndex).toBe(1);

    // Clamps out of bound index
    store.goToStep(99);
    expect(usePlayerStore.getState().currentStepIndex).toBe(4);

    store.goToStep(-10);
    expect(usePlayerStore.getState().currentStepIndex).toBe(0);
  });

  it('toggles playback and speed correctly', () => {
    const store = usePlayerStore.getState();
    store.togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    store.setSpeed(2);
    expect(usePlayerStore.getState().speed).toBe(2);

    store.togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('toggles beginner and advanced mode', () => {
    const store = usePlayerStore.getState();
    expect(store.mode).toBe('beginner');
    store.toggleMode();
    expect(usePlayerStore.getState().mode).toBe('advanced');
    store.toggleMode();
    expect(usePlayerStore.getState().mode).toBe('beginner');
  });
});
