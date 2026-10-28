import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePlayerStore } from '../src/engine/usePlayerStore';
import { playbackEffect } from '../src/engine/usePlaybackEngine';
import { bubbleSortAlgorithm } from '../src/algorithms/sorting/bubbleSort';
import { binarySearchAlgorithm } from '../src/algorithms/searching/binarySearch';
import { dijkstraAlgorithm } from '../src/algorithms/graphs/dijkstra';
import { sampleGraphs } from '../src/algorithms/graphs/sampleGraphs';
import { generateHashSteps } from '../src/algorithms/hashing/hashTable';
import type { Step } from '../src/types/algorithm';

function mountEngine() {
  let cleanup: (() => void) | null = null;
  const run = () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    const state = usePlayerStore.getState();
    cleanup = playbackEffect(
      state.isPlaying,
      state.speed,
      state.currentStepIndex,
      state.advancePlayback
    );
  };

  run();
  const unsub = usePlayerStore.subscribe(() => {
    run();
  });

  return {
    unmount: () => {
      unsub();
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    },
  };
}

describe('Priority 1: Autoplay Engine Rigorous Test Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    usePlayerStore.setState({
      steps: [],
      currentStepIndex: 0,
      isPlaying: false,
      speed: 1,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    usePlayerStore.setState({
      steps: [],
      currentStepIndex: 0,
      isPlaying: false,
      speed: 1,
    });
    vi.useRealTimers();
  });

  const suites: { name: string; getSteps: () => Step<any, any>[] }[] = [
    {
      name: 'Bubble Sort',
      getSteps: () => bubbleSortAlgorithm.generateSteps([45, 12, 85, 32, 89, 39, 69, 22]),
    },
    {
      name: 'Binary Search',
      getSteps: () =>
        binarySearchAlgorithm.generateSteps({
          array: [10, 20, 30, 40, 50, 60, 70, 80],
          target: 60,
        }),
    },
    {
      name: 'Dijkstra Shortest Path',
      getSteps: () =>
        dijkstraAlgorithm.generateSteps({
          graph: sampleGraphs.dijkstraRoadmap.data,
          startNodeId: 'A',
        }),
    },
    {
      name: 'Hash Table (Linear Probing Insert with Collision)',
      getSteps: () =>
        generateHashSteps({
          capacity: 7,
          collisionStrategy: 'linear-probing',
          hashFunction: 'division',
          initialEntries: [
            { key: 11, val: 'eleven' },
            { key: 18, val: 'eighteen' },
            { key: 25, val: 'twentyfive' },
          ],
          operation: { type: 'insert', key: 32, val: 'thirtytwo' },
        }),
    },
  ];

  for (const { name, getSteps } of suites) {
    describe(`Autoplay with ${name}`, () => {
      it('(a) after Play at 1x, advancing time by 1200ms increases step index by exactly 1, and 5 x 1200ms increases by exactly 5', () => {
        const steps = getSteps();
        expect(steps.length).toBeGreaterThan(5);
        usePlayerStore.getState().setSteps(steps);
        usePlayerStore.getState().setSpeed(1);

        const engine = mountEngine();
        expect(usePlayerStore.getState().currentStepIndex).toBe(0);

        usePlayerStore.getState().play();
        expect(usePlayerStore.getState().isPlaying).toBe(true);

        // Advance 1200ms
        vi.advanceTimersByTime(1200);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Advance 4 more periods of 1200ms -> total 5 steps from start
        vi.advanceTimersByTime(4 * 1200);
        expect(usePlayerStore.getState().currentStepIndex).toBe(5);

        engine.unmount();
      });

      it('(b) at 2x the delay is 600ms', () => {
        const steps = getSteps();
        usePlayerStore.getState().setSteps(steps);
        usePlayerStore.getState().setSpeed(2);

        const engine = mountEngine();
        usePlayerStore.getState().play();

        // After 599ms, step has not advanced yet
        vi.advanceTimersByTime(599);
        expect(usePlayerStore.getState().currentStepIndex).toBe(0);

        // At 600ms, step advances by 1
        vi.advanceTimersByTime(1);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Another 600ms advances to step 2
        vi.advanceTimersByTime(600);
        expect(usePlayerStore.getState().currentStepIndex).toBe(2);

        engine.unmount();
      });

      it('(c) Pause stops further advancing immediately', () => {
        const steps = getSteps();
        usePlayerStore.getState().setSteps(steps);
        usePlayerStore.getState().setSpeed(1);

        const engine = mountEngine();
        usePlayerStore.getState().play();

        // Advance 1 step
        vi.advanceTimersByTime(1200);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Pause
        usePlayerStore.getState().pause();
        expect(usePlayerStore.getState().isPlaying).toBe(false);

        // Time passes, but step index must remain frozen at 1
        vi.advanceTimersByTime(10000);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Resuming play continues from step 1
        usePlayerStore.getState().play();
        expect(usePlayerStore.getState().isPlaying).toBe(true);
        vi.advanceTimersByTime(1200);
        expect(usePlayerStore.getState().currentStepIndex).toBe(2);

        engine.unmount();
      });

      it('(d) reaching the last step sets isPlaying to false and button allows Replay from step 1', () => {
        const steps = getSteps();
        usePlayerStore.getState().setSteps(steps);
        usePlayerStore.getState().setSpeed(4); // fast stepping

        const engine = mountEngine();
        // Jump close to end: second to last step
        usePlayerStore.getState().goToStep(steps.length - 2);
        expect(usePlayerStore.getState().currentStepIndex).toBe(steps.length - 2);

        usePlayerStore.getState().play();
        expect(usePlayerStore.getState().isPlaying).toBe(true);

        // Advance 300ms (1200ms / 4)
        vi.advanceTimersByTime(300);

        // Reached last step: isPlaying becomes false automatically
        expect(usePlayerStore.getState().currentStepIndex).toBe(steps.length - 1);
        expect(usePlayerStore.getState().isPlaying).toBe(false);

        // Button state check: isAtEnd is true -> Replay button
        const isAtEnd =
          usePlayerStore.getState().steps.length > 1 &&
          usePlayerStore.getState().currentStepIndex >=
            usePlayerStore.getState().steps.length - 1;
        expect(isAtEnd).toBe(true);

        // Pressing Play/Replay restarts again from step 0 and plays
        usePlayerStore.getState().play();
        expect(usePlayerStore.getState().currentStepIndex).toBe(0);
        expect(usePlayerStore.getState().isPlaying).toBe(true);

        engine.unmount();
      });

      it('(e) changing speed while playing takes effect from the next step', () => {
        const steps = getSteps();
        usePlayerStore.getState().setSteps(steps);
        usePlayerStore.getState().setSpeed(1);

        const engine = mountEngine();
        usePlayerStore.getState().play();

        // 1st step at 1x
        vi.advanceTimersByTime(1200);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Change speed mid-play to 0.5x (delay should become 2400ms)
        usePlayerStore.getState().setSpeed(0.5);

        // 1200ms is not enough at 0.5x
        vi.advanceTimersByTime(1200);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Another 1200ms (total 2400ms) triggers step 2
        vi.advanceTimersByTime(1200);
        expect(usePlayerStore.getState().currentStepIndex).toBe(2);

        engine.unmount();
      });

      it('(f) Next / Prev / timeline drag during playback pauses it and moves exactly one step', () => {
        const steps = getSteps();
        usePlayerStore.getState().setSteps(steps);

        const engine = mountEngine();
        usePlayerStore.getState().play();
        expect(usePlayerStore.getState().isPlaying).toBe(true);

        // User clicks Next while playing
        usePlayerStore.getState().nextStep();
        expect(usePlayerStore.getState().isPlaying).toBe(false);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Timers do not advance further
        vi.advanceTimersByTime(5000);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // User drags timeline slider while playing
        usePlayerStore.getState().play();
        expect(usePlayerStore.getState().isPlaying).toBe(true);

        usePlayerStore.getState().goToStep(4);
        expect(usePlayerStore.getState().isPlaying).toBe(false);
        expect(usePlayerStore.getState().currentStepIndex).toBe(4);

        engine.unmount();
      });

      it('(g) switching algorithm, preset or input stops playback and resets to step 1', () => {
        const steps = getSteps();
        usePlayerStore.getState().setSteps(steps);

        const engine = mountEngine();
        usePlayerStore.getState().play();
        vi.advanceTimersByTime(1200);
        expect(usePlayerStore.getState().isPlaying).toBe(true);
        expect(usePlayerStore.getState().currentStepIndex).toBe(1);

        // Switching algorithm/input sets new steps
        const newSteps = bubbleSortAlgorithm.generateSteps([5, 4, 3, 2, 1]);
        usePlayerStore.getState().setSteps(newSteps);

        expect(usePlayerStore.getState().isPlaying).toBe(false);
        expect(usePlayerStore.getState().currentStepIndex).toBe(0);

        engine.unmount();
      });

      it('(h) leaving page or unmounting clears timer with no pending timers', () => {
        const steps = getSteps();
        usePlayerStore.getState().setSteps(steps);

        const engine = mountEngine();
        usePlayerStore.getState().play();

        // While playing with a timer active
        expect(vi.getTimerCount()).toBeGreaterThan(0);

        // Unmount
        engine.unmount();

        // Pending timer cleared immediately
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  }
});
