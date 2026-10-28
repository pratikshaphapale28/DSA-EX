import type { GraphData } from '../../types/graph';

export const sampleGraphs: Record<string, { label: string; description: string; data: GraphData; defaultStart: string; defaultTarget?: string }> = {
  dijkstraRoadmap: {
    label: 'Dijkstra Roadmap (Weighted)',
    description: 'A 6-node road network with varied positive edge weights. Ideal for shortest path calculations.',
    defaultStart: 'A',
    defaultTarget: 'F',
    data: {
      isDirected: true,
      isWeighted: true,
      nodes: [
        { id: 'A', label: 'A', x: 80, y: 160 },
        { id: 'B', label: 'B', x: 220, y: 70 },
        { id: 'C', label: 'C', x: 220, y: 250 },
        { id: 'D', label: 'D', x: 380, y: 70 },
        { id: 'E', label: 'E', x: 380, y: 250 },
        { id: 'F', label: 'F', x: 520, y: 160 },
      ],
      edges: [
        { id: 'e-A-B', source: 'A', target: 'B', weight: 4 },
        { id: 'e-A-C', source: 'A', target: 'C', weight: 2 },
        { id: 'e-B-C', source: 'B', target: 'C', weight: 1 },
        { id: 'e-B-D', source: 'B', target: 'D', weight: 5 },
        { id: 'e-C-D', source: 'C', target: 'D', weight: 8 },
        { id: 'e-C-E', source: 'C', target: 'E', weight: 10 },
        { id: 'e-D-E', source: 'D', target: 'E', weight: 2 },
        { id: 'e-D-F', source: 'D', target: 'F', weight: 6 },
        { id: 'e-E-F', source: 'E', target: 'F', weight: 3 },
      ],
    },
  },

  cyclicGraph: {
    label: 'Cyclic Graph (Undirected)',
    description: 'A 5-node graph with multiple cycles. Demonstrates BFS level-by-level exploration vs DFS deep backtracking.',
    defaultStart: 'A',
    data: {
      isDirected: false,
      isWeighted: false,
      nodes: [
        { id: 'A', label: 'A', x: 140, y: 80 },
        { id: 'B', label: 'B', x: 340, y: 80 },
        { id: 'C', label: 'C', x: 440, y: 220 },
        { id: 'D', label: 'D', x: 240, y: 270 },
        { id: 'E', label: 'E', x: 100, y: 220 },
      ],
      edges: [
        { id: 'e-A-B', source: 'A', target: 'B', weight: 1 },
        { id: 'e-B-C', source: 'B', target: 'C', weight: 1 },
        { id: 'e-C-D', source: 'C', target: 'D', weight: 1 },
        { id: 'e-D-E', source: 'D', target: 'E', weight: 1 },
        { id: 'e-E-A', source: 'E', target: 'A', weight: 1 },
        { id: 'e-A-D', source: 'A', target: 'D', weight: 1 },
        { id: 'e-B-D', source: 'B', target: 'D', weight: 1 },
      ],
    },
  },

  disconnectedGraph: {
    label: 'Disconnected Graph (2 Components)',
    description: 'Contains two disjoint components (A-B-C and D-E) plus isolated node F. Tests unreachable handling.',
    defaultStart: 'A',
    defaultTarget: 'D',
    data: {
      isDirected: false,
      isWeighted: true,
      nodes: [
        { id: 'A', label: 'A', x: 100, y: 90 },
        { id: 'B', label: 'B', x: 220, y: 90 },
        { id: 'C', label: 'C', x: 160, y: 220 },
        { id: 'D', label: 'D', x: 380, y: 90 },
        { id: 'E', label: 'E', x: 480, y: 190 },
        { id: 'F', label: 'F', x: 360, y: 240 },
      ],
      edges: [
        { id: 'e-A-B', source: 'A', target: 'B', weight: 3 },
        { id: 'e-B-C', source: 'B', target: 'C', weight: 2 },
        { id: 'e-C-A', source: 'C', target: 'A', weight: 4 },
        { id: 'e-D-E', source: 'D', target: 'E', weight: 5 },
      ],
    },
  },

  treeDAG: {
    label: 'Tree / Directed Acyclic Graph (DAG)',
    description: 'A directed hierarchy without cycles, highlighting tree-like breadth and depth traversals.',
    defaultStart: 'A',
    data: {
      isDirected: true,
      isWeighted: false,
      nodes: [
        { id: 'A', label: 'A', x: 280, y: 60 },
        { id: 'B', label: 'B', x: 160, y: 160 },
        { id: 'C', label: 'C', x: 400, y: 160 },
        { id: 'D', label: 'D', x: 100, y: 260 },
        { id: 'E', label: 'E', x: 220, y: 260 },
        { id: 'F', label: 'F', x: 460, y: 260 },
      ],
      edges: [
        { id: 'e-A-B', source: 'A', target: 'B', weight: 1 },
        { id: 'e-A-C', source: 'A', target: 'C', weight: 1 },
        { id: 'e-B-D', source: 'B', target: 'D', weight: 1 },
        { id: 'e-B-E', source: 'B', target: 'E', weight: 1 },
        { id: 'e-C-F', source: 'C', target: 'F', weight: 1 },
      ],
    },
  },

  negativeEdgeDemo: {
    label: 'Negative Edge Warning Demo',
    description: 'Contains a negative edge weight (-3). Triggers Dijkstra negative weight rejection alert.',
    defaultStart: 'A',
    defaultTarget: 'C',
    data: {
      isDirected: true,
      isWeighted: true,
      nodes: [
        { id: 'A', label: 'A', x: 120, y: 160 },
        { id: 'B', label: 'B', x: 280, y: 80 },
        { id: 'C', label: 'C', x: 440, y: 160 },
        { id: 'D', label: 'D', x: 280, y: 240 },
      ],
      edges: [
        { id: 'e-A-B', source: 'A', target: 'B', weight: 2 },
        { id: 'e-B-C', source: 'B', target: 'C', weight: -3 }, // Negative weight!
        { id: 'e-A-D', source: 'A', target: 'D', weight: 1 },
        { id: 'e-D-C', source: 'D', target: 'C', weight: 4 },
      ],
    },
  },
};
