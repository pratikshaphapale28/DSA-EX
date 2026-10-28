import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { GraphAlgorithmInput, GraphSnapshot } from '../../types/graph';
import { sampleGraphs } from './sampleGraphs';

const bfsPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function bfs(graph, start):', explanation: 'Breadth-First Search traverses level by level' },
  { line: 2, code: '  queue = [start]; visited = {start}', explanation: 'Initialize FIFO queue and visited set with start node' },
  { line: 3, code: '  while queue is not empty:', explanation: 'Process nodes in FIFO arrival order' },
  { line: 4, code: '    u = queue.pop_front(); visit(u)', explanation: 'Extract front node from queue to explore its neighbors' },
  { line: 5, code: '    for each neighbor v of u:', explanation: 'Inspect all outgoing/incident edges' },
  { line: 6, code: '      if v not in visited:', explanation: 'Check if neighbor has already been discovered' },
  { line: 7, code: '        visited.add(v); queue.push(v)', explanation: 'Encounter new node: record in visited set and enqueue' },
];

const bfsComplexity: ComplexityMetric = {
  best: 'O(V + E)',
  average: 'O(V + E)',
  worst: 'O(V + E)',
  plainEnglish: 'Visits every reachable vertex once and examines every incident edge once using a FIFO queue.',
  space: 'O(V)',
};

export function generateBFSSteps(input: GraphAlgorithmInput): Step<GraphSnapshot, Record<string, unknown>>[] {
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
      description: 'Add at least 2 nodes to the canvas to run BFS traversal.',
      explanationDetail: 'Click anywhere on the canvas to place nodes, then drag between nodes to connect edges.',
      codeLine: 1,
      state: {
        graph,
        startNodeId: graph.nodes[0]?.id || 'A',
        visitedNodes: [],
        traversalOrder: [],
        emptyStateMessage: 'Add at least 2 nodes to run BFS',
      },
      auxiliaryState: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, accesses: 0 },
    });
    return steps;
  }

  // Validate start node
  const effectiveStart = graph.nodes.find((n) => n.id === startNodeId)?.id || graph.nodes[0].id;

  const queue: string[] = [effectiveStart];
  const visited = new Set<string>([effectiveStart]);
  const traversalOrder: string[] = [effectiveStart];

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
        queue: [...queue],
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
      `Starting BFS traversal from node (${effectiveStart}).`,
      `Enqueued start node (${effectiveStart}) into FIFO queue and added to visited set.`,
      2,
      'start',
      effectiveStart
    )
  );

  while (queue.length > 0) {
    iterations++;
    accesses++;
    const u = queue.shift()!;
    operations++;

    steps.push(
      createSnapshot(
        `Dequeued node (${u}) from front of queue. Exploring its outgoing neighbors.`,
        `Node (${u}) is now the active vertex. We will inspect all incident edges in alphabetical order.`,
        4,
        'dequeue',
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

    // Map each edge to neighbor target ID
    const neighborPairs = outgoingEdges.map((e) => ({
      edgeId: e.id,
      neighborId: e.source === u ? e.target : e.source,
    }));

    // Sort neighbors alphabetically for deterministic traversal
    neighborPairs.sort((a, b) => a.neighborId.localeCompare(b.neighborId));

    for (const { edgeId, neighborId } of neighborPairs) {
      comparisons++;
      accesses++;

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
        traversalOrder.push(neighborId);
        operations++;

        steps.push(
          createSnapshot(
            `Discovered new neighbor (${neighborId}) along edge ${u} → ${neighborId}.`,
            `Added (${neighborId}) to visited set and pushed into the rear of the FIFO queue.`,
            7,
            'enqueue',
            neighborId,
            edgeId
          )
        );
      } else {
        steps.push(
          createSnapshot(
            `Neighbor (${neighborId}) has already been visited. Skipping edge ${u} → ${neighborId}.`,
            `Cycles or cross-edges to visited nodes are ignored to prevent infinite loops.`,
            6,
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
        `The graph contains multiple disjoint components. In standard BFS, only the connected component containing the start vertex is visited.`,
        3,
        'not-found'
      )
    );
  }

  // Completion step
  steps.push(
    createSnapshot(
      `BFS traversal complete! Visited ${visited.size} / ${graph.nodes.length} nodes.`,
      `Final Traversal Order: [${traversalOrder.join(' → ')}]. All levels fully processed.`,
      1,
      'complete'
    )
  );

  return steps;
}

export const bfsAlgorithm: AlgorithmDefinition<GraphAlgorithmInput, GraphSnapshot, Record<string, unknown>> = {
  id: 'bfs',
  name: 'Breadth-First Search (BFS)',
  category: 'graphs',
  description: 'Explores graph vertices layer by layer using a FIFO queue, guaranteeing shortest hop count in unweighted graphs.',
  realWorldAnalogy: 'A water droplet causing ripples expanding outwards in concentric circles, or social media degrees of separation.',
  complexity: bfsComplexity,
  pseudocode: bfsPseudocode,
  generateSteps: generateBFSSteps,
  defaultInput: {
    graph: sampleGraphs.dijkstraRoadmap.data,
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
