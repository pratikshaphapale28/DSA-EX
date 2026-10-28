import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { GraphAlgorithmInput, GraphSnapshot } from '../../types/graph';
import { sampleGraphs } from './sampleGraphs';

const dfsPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function dfs(graph, start):', explanation: 'Depth-First Search explores deeply along paths before backtracking' },
  { line: 2, code: '  stack = [start]; visited = set()', explanation: 'Initialize LIFO call stack with start node' },
  { line: 3, code: '  while stack is not empty:', explanation: 'Process vertices in Last-In First-Out order' },
  { line: 4, code: '    u = stack.pop()', explanation: 'Pop top vertex from stack' },
  { line: 5, code: '    if u not in visited:', explanation: 'Check if vertex has not yet been processed' },
  { line: 6, code: '      visited.add(u); visit(u)', explanation: 'Mark vertex visited and record in traversal order' },
  { line: 7, code: '      for each neighbor v of u (reversed):', explanation: 'Push neighbors onto stack (reversed to preserve forward order)' },
  { line: 8, code: '        if v not in visited: stack.push(v)', explanation: 'Push unvisited neighbor onto stack' },
];

const dfsComplexity: ComplexityMetric = {
  best: 'O(V + E)',
  average: 'O(V + E)',
  worst: 'O(V + E)',
  plainEnglish: 'Explores each vertex and backtracks along each edge once using a LIFO call stack.',
  space: 'O(V)',
};

export function generateDFSSteps(input: GraphAlgorithmInput): Step<GraphSnapshot, Record<string, unknown>>[] {
  const { graph, startNodeId } = input;
  const steps: Step<GraphSnapshot, Record<string, unknown>>[] = [];

  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;
  let operations = 0;

  // Empty state check
  if (!graph.nodes || graph.nodes.length < 2) {
    steps.push({
      id: 0,
      type: 'start',
      description: 'Add at least 2 nodes to the canvas to run DFS traversal.',
      explanationDetail: 'Click anywhere on the canvas to place nodes, then drag between nodes to connect edges.',
      codeLine: 1,
      state: {
        graph,
        startNodeId: graph.nodes[0]?.id || 'A',
        visitedNodes: [],
        traversalOrder: [],
        emptyStateMessage: 'Add at least 2 nodes to run DFS',
      },
      auxiliaryState: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, accesses: 0 },
    });
    return steps;
  }

  // Validate start node
  const effectiveStart = graph.nodes.find((n) => n.id === startNodeId)?.id || graph.nodes[0].id;

  const stack: string[] = [effectiveStart];
  const visited = new Set<string>();
  const traversalOrder: string[] = [];

  function createSnapshot(
    desc: string,
    detail: string,
    codeLine: number,
    type: Step['type'] = 'visit',
    activeNode: string | null = null,
    activeEdge: string | null = null
  ): Step<GraphSnapshot, Record<string, unknown>> {
    return {
      id: steps.length,
      type,
      description: desc,
      explanationDetail: detail,
      codeLine,
      highlightedNodes: activeNode ? [activeNode] : [],
      state: {
        graph: JSON.parse(JSON.stringify(graph)),
        startNodeId: effectiveStart,
        activeNodeId: activeNode,
        activeEdgeId: activeEdge,
        visitedNodes: Array.from(visited),
        stack: [...stack],
        traversalOrder: [...traversalOrder],
      },
      auxiliaryState: {},
      counters: {
        comparisons,
        swaps: operations,
        iterations,
        accesses,
      },
    };
  }

  // Initial step
  steps.push(
    createSnapshot(
      `Starting DFS traversal from node (${effectiveStart}).`,
      `Pushed start node (${effectiveStart}) onto the LIFO stack.`,
      2,
      'start',
      effectiveStart
    )
  );

  while (stack.length > 0) {
    iterations++;
    accesses++;
    const u = stack.pop()!;
    operations++;

    comparisons++;
    if (visited.has(u)) {
      steps.push(
        createSnapshot(
          `Popped node (${u}) from stack, but it was already visited. Backtracking.`,
          `Node (${u}) was reached via an alternate path earlier; skipping re-visiting.`,
          5,
          'visit',
          u
        )
      );
      continue;
    }

    // Mark visited
    visited.add(u);
    traversalOrder.push(u);

    steps.push(
      createSnapshot(
        `Visited node (${u}). Processing its deepest outgoing branch.`,
        `Marked (${u}) in visited set and recorded in traversal output sequence.`,
        6,
        'visit',
        u
      )
    );

    // Find outgoing neighbors
    const outgoingEdges = graph.edges.filter((e) => {
      if (graph.isDirected) {
        return e.source === u;
      }
      return e.source === u || e.target === u;
    });

    const neighborPairs = outgoingEdges.map((e) => ({
      edgeId: e.id,
      neighborId: e.source === u ? e.target : e.source,
    }));

    // For LIFO stack, to visit neighbors in alphabetical order (A, B, C), we push them in reverse (C, B, A)
    neighborPairs.sort((a, b) => b.neighborId.localeCompare(a.neighborId));

    for (const { edgeId, neighborId } of neighborPairs) {
      comparisons++;
      accesses++;

      if (!visited.has(neighborId)) {
        stack.push(neighborId);
        operations++;

        steps.push(
          createSnapshot(
            `Pushed unvisited neighbor (${neighborId}) onto stack along edge ${u} → ${neighborId}.`,
            `Neighbor (${neighborId}) is staged on top of the call stack for depth-first descent.`,
            8,
            'push',
            neighborId,
            edgeId
          )
        );
      } else {
        steps.push(
          createSnapshot(
            `Neighbor (${neighborId}) already visited. Ignoring back-edge ${u} → ${neighborId}.`,
            `Back-edge or cross-edge detected; cycle prevention active.`,
            7,
            'visit',
            u,
            edgeId
          )
        );
      }
    }
  }

  // Check for disconnected / unreachable components
  const allNodeIds = graph.nodes.map((n) => n.id);
  const unreachableNodes = allNodeIds.filter((id) => !visited.has(id));

  if (unreachableNodes.length > 0) {
    steps.push(
      createSnapshot(
        `Disconnected Graph Notice: ${unreachableNodes.length} node(s) [${unreachableNodes.join(', ')}] are unreachable from start node (${effectiveStart}).`,
        `The graph contains multiple disjoint components. In standard DFS, vertices outside the start component are unreachable.`,
        3,
        'not-found'
      )
    );
  }

  // Completion step
  steps.push(
    createSnapshot(
      `DFS traversal complete! Visited ${visited.size} / ${graph.nodes.length} nodes.`,
      `Final Traversal Order: [${traversalOrder.join(' → ')}]. Stack is empty.`,
      1,
      'complete'
    )
  );

  return steps;
}

export const dfsAlgorithm: AlgorithmDefinition<GraphAlgorithmInput, GraphSnapshot, Record<string, unknown>> = {
  id: 'dfs',
  name: 'Depth-First Search (DFS)',
  category: 'graphs',
  description: 'Explores vertices deeply along branches before backtracking using a LIFO call stack.',
  realWorldAnalogy: 'Navigating a labyrinth or maze with a spool of thread, unwinding deeper and backtracking upon dead ends.',
  complexity: dfsComplexity,
  pseudocode: dfsPseudocode,
  generateSteps: generateDFSSteps,
  defaultInput: {
    graph: sampleGraphs.cyclicGraph.data,
    startNodeId: 'A',
  },
  sampleInputs: Object.entries(sampleGraphs).map(([, val]) => ({
    label: val.label,
    input: {
      graph: val.data,
      startNodeId: val.defaultStart,
      targetNodeId: val.defaultTarget,
    },
  })),
};
