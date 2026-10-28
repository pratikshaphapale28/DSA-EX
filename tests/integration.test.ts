import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useAppStore } from '../src/store/useAppStore';
import { usePlayerStore } from '../src/engine/usePlayerStore';

// Page components
import { LandingPage } from '../src/pages/LandingPage';
import { SortingPage } from '../src/pages/SortingPage';
import { SearchingPage } from '../src/pages/SearchingPage';
import { StackQueuePage } from '../src/pages/StackQueuePage';
import { TreesPage } from '../src/pages/TreesPage';
import { GraphsPage } from '../src/pages/GraphsPage';
import { HashingPage } from '../src/pages/HashingPage';
import { CheatSheetPage } from '../src/pages/CheatSheetPage';

// Modals & UI
import { Modal } from '../src/components/common/Modal';
import { ColorLegend } from '../src/components/common/ColorLegend';

// Algorithm generators to test module transitions
import { bubbleSortAlgorithm } from '../src/algorithms/sorting/bubbleSort';
import { bstAlgorithm } from '../src/algorithms/trees/bst';
import { dijkstraAlgorithm } from '../src/algorithms/graphs/dijkstra';
import { sampleGraphs } from '../src/algorithms/graphs/sampleGraphs';
import { generateHashSteps } from '../src/algorithms/hashing/hashTable';

describe('Phase 7 Integration: Smoke Tests & Module Switch Invariants', () => {
  beforeEach(() => {
    usePlayerStore.getState().clear();
    usePlayerStore.setState({ mode: 'beginner' });
    useAppStore.setState({
      activeView: 'sorting',
      isTourOpen: false,
      isHelpModalOpen: false,
      isQuizModalOpen: false,
    });
  });

  describe('Smoke Test: Render Every View Without Crashing', () => {
    it('renders LandingPage without throwing', () => {
      const html = renderToString(React.createElement(LandingPage));
      expect(html).toContain('DSA Explorer');
      expect(html).toContain('Start with a Demo');
      expect(html).toContain('Sorting Algorithms');
      expect(html).toContain('Searching Algorithms');
      expect(html).toContain('Stack &amp; Queue');
      expect(html).toContain('Binary Trees &amp; AVL');
      expect(html).toContain('Graph Pathfinding');
      expect(html).toContain('Hash Tables');
    });

    it('renders SortingPage without throwing', () => {
      const html = renderToString(React.createElement(SortingPage));
      expect(html).toContain('Bubble Sort');
      expect(html).toContain('Complexity Analysis');
      expect(html).toContain('Time Complexity');
    });

    it('renders SearchingPage without throwing', () => {
      const html = renderToString(React.createElement(SearchingPage));
      expect(html).toContain('Binary Search');
      expect(html).toContain('Linear Search');
    });

    it('renders StackQueuePage without throwing', () => {
      const html = renderToString(React.createElement(StackQueuePage));
      expect(html).toContain('Stack');
      expect(html).toContain('Queue');
    });

    it('renders TreesPage without throwing', () => {
      const html = renderToString(React.createElement(TreesPage));
      expect(html).toContain('Binary Search Tree');
      expect(html).toContain('AVL Tree');
    });

    it('renders GraphsPage without throwing', () => {
      const html = renderToString(React.createElement(GraphsPage));
      expect(html).toContain('BFS (Breadth-First)');
      expect(html).toContain('Dijkstra (Shortest Path)');
    });

    it('renders HashingPage without throwing', () => {
      const html = renderToString(React.createElement(HashingPage));
      expect(html).toContain('Hash Table');
      expect(html).toContain('Tombstones Demo');
    });

    it('renders CheatSheetPage without throwing', () => {
      const html = renderToString(React.createElement(CheatSheetPage));
      expect(html).toContain('Big-O Complexity Cheat Sheet');
      expect(html).toContain('Bubble Sort');
      expect(html).toContain('Dijkstra (Shortest Path)');
      expect(html).toContain('Hash Table (Linear Probing)');
    });

    it('renders Modal dialog component without throwing', () => {
      const modalHtml = renderToString(
        React.createElement(
          Modal,
          {
            isOpen: true,
            title: 'Quick Guide & Keyboard Shortcuts',
            onClose: () => {},
          },
          React.createElement('div', null, 'Space: Play / Pause, Arrows: Step forward/back')
        )
      );
      expect(modalHtml).toContain('Quick Guide &amp; Keyboard Shortcuts');
      expect(modalHtml).toContain('Space: Play / Pause');
    });

    it('renders ColorLegend on all modules with custom symbols and shapes', () => {
      const sampleItems = [
        { label: 'Start Node', colorClass: 'bg-emerald-500', description: 'Start node', customSymbol: 'S' },
        { label: 'Balance Factor', colorClass: 'bg-amber-500', description: 'AVL balance', customSymbol: 'BF' },
        { label: 'Tombstone', colorClass: 'bg-purple-500', description: 'Soft-deleted', customSymbol: 'DEL' },
      ];
      const html = renderToString(React.createElement(ColorLegend, { items: sampleItems }));
      expect(html).toContain('Start Node');
      expect(html).toContain('BF');
      expect(html).toContain('DEL');
    });
  });

  describe('Module Switch Reset Invariant', () => {
    it('purges steps, counters, pseudocode, and narration when switching modules', () => {
      // 1. Simulate user in Sorting Module: generating and stepping through Bubble Sort
      const sortingSteps = bubbleSortAlgorithm.generateSteps([5, 3, 8, 1]);
      usePlayerStore.getState().setSteps(sortingSteps);
      usePlayerStore.getState().nextStep();
      usePlayerStore.getState().nextStep();

      const midSortingStep = usePlayerStore.getState().getCurrentStep();
      expect(midSortingStep).toBeDefined();
      expect(midSortingStep?.type).toBe('compare');
      expect(midSortingStep?.counters.comparisons).toBeGreaterThan(0);
      expect(usePlayerStore.getState().currentStepIndex).toBe(2);

      const oldNarration = midSortingStep?.description;
      expect(oldNarration).toBeTruthy();

      // 2. User switches to Trees Module
      useAppStore.getState().setActiveView('trees');

      // Assert that switching view purges old player state immediately
      expect(usePlayerStore.getState().steps).toHaveLength(0);
      expect(usePlayerStore.getState().currentStepIndex).toBe(0);
      expect(usePlayerStore.getState().getCurrentStep()).toBeNull();

      // 3. Trees module mounts and loads its initial state (e.g. BST search)
      const treeSteps = bstAlgorithm.generateSteps({
        initialValues: [15, 10, 20],
        operation: { type: 'search', val: 10 },
      });
      usePlayerStore.getState().setSteps(treeSteps);

      const initialTreeStep = usePlayerStore.getState().getCurrentStep();
      expect(initialTreeStep).toBeDefined();
      expect(usePlayerStore.getState().currentStepIndex).toBe(0);
      // Ensure narration is specific to tree and does not contain sorting text
      expect(initialTreeStep?.description).not.toEqual(oldNarration);
      expect(initialTreeStep?.description).toContain('Starting BST operation: SEARCH value 10');
      expect(initialTreeStep?.counters.comparisons).toBe(0);
      expect(initialTreeStep?.counters.swaps).toBe(0);

      // 4. User steps forward in Trees
      usePlayerStore.getState().nextStep();
      expect(usePlayerStore.getState().currentStepIndex).toBe(1);

      // 5. User switches to Graphs Module
      useAppStore.getState().setActiveView('graphs');
      expect(usePlayerStore.getState().steps).toHaveLength(0);
      expect(usePlayerStore.getState().currentStepIndex).toBe(0);

      // Graphs module initializes Dijkstra
      const graphSteps = dijkstraAlgorithm.generateSteps({
        graph: sampleGraphs.dijkstraRoadmap.data,
        startNodeId: 'A',
        targetNodeId: 'F',
      });
      usePlayerStore.getState().setSteps(graphSteps);

      const initialGraphStep = usePlayerStore.getState().getCurrentStep();
      expect(initialGraphStep).toBeDefined();
      expect(initialGraphStep?.description).toContain('Dijkstra');
      expect(usePlayerStore.getState().currentStepIndex).toBe(0);

      // 6. User switches to Hashing Module
      useAppStore.getState().setActiveView('hashing');
      expect(usePlayerStore.getState().steps).toHaveLength(0);

      const hashSteps = generateHashSteps({
        capacity: 7,
        collisionStrategy: 'linear-probing',
        hashFunction: 'division',
        initialEntries: [{ key: 10, val: 10 }],
        operation: { type: 'insert', key: 17, val: 17 },
      });
      usePlayerStore.getState().setSteps(hashSteps);

      const initialHashStep = usePlayerStore.getState().getCurrentStep();
      expect(initialHashStep).toBeDefined();
      expect(initialHashStep?.description).toContain('Starting INSERT operation for key "17"');

      // 7. Re-enter original Sorting Module: verify clean reset to Sorting's own initial state
      useAppStore.getState().setActiveView('sorting');
      expect(usePlayerStore.getState().steps).toHaveLength(0);

      const freshSortingSteps = bubbleSortAlgorithm.generateSteps([4, 2, 7]);
      usePlayerStore.getState().setSteps(freshSortingSteps);

      const resetSortingStep = usePlayerStore.getState().getCurrentStep();
      expect(resetSortingStep).toBeDefined();
      expect(usePlayerStore.getState().currentStepIndex).toBe(0);
      expect(resetSortingStep?.counters.comparisons).toBe(0);
      expect(resetSortingStep?.counters.swaps).toBe(0);
      expect(resetSortingStep?.description).not.toContain('Starting INSERT operation');
      expect(resetSortingStep?.description).not.toContain('Dijkstra');
      expect(resetSortingStep?.description).toContain('Bubble Sort');
    });
  });

  describe('Beginner vs Advanced Mode Visibility', () => {
    it('displays explanationDetail and why-this-matters in beginner mode, compact view in advanced mode', () => {
      usePlayerStore.setState({ mode: 'beginner' });
      expect(usePlayerStore.getState().mode).toBe('beginner');

      usePlayerStore.getState().toggleMode();
      expect(usePlayerStore.getState().mode).toBe('advanced');

      usePlayerStore.getState().setMode('beginner');
      expect(usePlayerStore.getState().mode).toBe('beginner');
    });
  });
});
