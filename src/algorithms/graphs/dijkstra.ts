import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type {
  GraphAlgorithmInput,
  GraphSnapshot,
  DistanceTableRow,
  PriorityQueueItem,
  RelaxationDetail,
} from '../../types/graph';
import { sampleGraphs } from './sampleGraphs';

const dijkstraPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function dijkstra(graph, start, target):', explanation: 'Dijkstra computes single-source shortest paths on non-negative weighted graphs' },
  { line: 2, code: '  dist = {all: ∞}; dist[start] = 0; pq = [(start, 0)]', explanation: 'Initialize distance table and priority queue with start node' },
  { line: 3, code: '  while pq is not empty:', explanation: 'Extract vertices greedily by minimum known distance' },
  { line: 4, code: '    (u, d) = pq.extract_min(); mark u as settled', explanation: 'Current minimum vertex u is permanently settled' },
  { line: 5, code: '    if u == target: break // Target reached', explanation: 'Early exit if optional destination reached' },
  { line: 6, code: '    for each outgoing edge (u, v, weight):', explanation: 'Examine all outgoing edges from settled vertex u' },
  { line: 7, code: '      if dist[u] + weight < dist[v]: // Relaxation', explanation: 'Check if path via u improves best known distance to v' },
  { line: 8, code: '        dist[v] = dist[u] + weight; prev[v] = u; pq.push((v, dist[v]))', explanation: 'Relax edge: update distance, set previous pointer, enqueue' },
];

const dijkstraComplexity: ComplexityMetric = {
  best: 'O((V + E) log V)',
  average: 'O((V + E) log V)',
  worst: 'O((V + E) log V)',
  plainEnglish: 'Uses a binary heap priority queue. Each vertex extracted in O(log V) and each edge relaxed in O(log V).',
  space: 'O(V)',
};

export function generateDijkstraSteps(input: GraphAlgorithmInput): Step<GraphSnapshot, Record<string, unknown>>[] {
  const { graph, startNodeId, targetNodeId } = input;
  const steps: Step<GraphSnapshot, Record<string, unknown>>[] = [];

  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;
  let operations = 0;

  // 1. Negative edge weights validation check
  const negativeEdge = graph.edges.find((e) => e.weight < 0);
  if (negativeEdge) {
    const errorMsg = `Negative edge detected (${negativeEdge.source} → ${negativeEdge.target} with weight ${negativeEdge.weight}). Dijkstra's algorithm requires all edge weights to be non-negative (w ≥ 0). Negative weights break greedy optimality. Use Bellman-Ford for graphs with negative weights.`;
    steps.push({
      id: 0,
      type: 'not-found',
      description: 'Error: Dijkstra does not support negative edge weights.',
      explanationDetail: errorMsg,
      codeLine: 1,
      highlightedEdges: [[negativeEdge.source, negativeEdge.target]],
      state: {
        graph: JSON.parse(JSON.stringify(graph)),
        startNodeId: graph.nodes[0]?.id || 'A',
        targetNodeId,
        visitedNodes: [],
        traversalOrder: [],
        hasNegativeWeight: true,
        negativeWeightErrorMessage: errorMsg,
      },
      auxiliaryState: {},
      counters: { comparisons: 1, swaps: 0, iterations: 0, accesses: 1 },
    });
    return steps;
  }

  // 2. Empty state check
  if (!graph.nodes || graph.nodes.length < 2) {
    steps.push({
      id: 0,
      type: 'start',
      description: 'Add at least 2 nodes to the canvas to run Dijkstra shortest path.',
      explanationDetail: 'Click anywhere on the canvas to place nodes, then drag between nodes to connect edges.',
      codeLine: 1,
      state: {
        graph,
        startNodeId: graph.nodes[0]?.id || 'A',
        targetNodeId,
        visitedNodes: [],
        traversalOrder: [],
        emptyStateMessage: 'Add at least 2 nodes to run Dijkstra',
      },
      auxiliaryState: {},
      counters: { comparisons: 0, swaps: 0, iterations: 0, accesses: 0 },
    });
    return steps;
  }

  // Validate start node
  const effectiveStart = graph.nodes.find((n) => n.id === startNodeId)?.id || graph.nodes[0].id;
  const effectiveTarget = targetNodeId ? graph.nodes.find((n) => n.id === targetNodeId)?.id || null : null;

  // Initialize distance table & priority queue
  const distanceTable: Record<string, DistanceTableRow> = {};
  for (const node of graph.nodes) {
    distanceTable[node.id] = {
      nodeId: node.id,
      distance: node.id === effectiveStart ? 0 : Number.POSITIVE_INFINITY,
      previousNodeId: null,
      status: node.id === effectiveStart ? 'queued' : 'unvisited',
    };
  }

  const priorityQueue: PriorityQueueItem[] = [{ nodeId: effectiveStart, distance: 0 }];
  const settledNodes = new Set<string>();
  const traversalOrder: string[] = [];

  function cloneDistanceTable(): Record<string, DistanceTableRow> {
    const copy: Record<string, DistanceTableRow> = {};
    for (const [k, v] of Object.entries(distanceTable)) {
      copy[k] = { ...v };
    }
    return copy;
  }

  function getShortestPath(destId: string): { pathNodes: string[]; pathEdges: string[] } {
    if (distanceTable[destId]?.distance === Number.POSITIVE_INFINITY) {
      return { pathNodes: [], pathEdges: [] };
    }

    const pathNodes: string[] = [];
    const pathEdges: string[] = [];

    let curr: string | null = destId;
    while (curr) {
      pathNodes.unshift(curr);
      const prev: string | null = distanceTable[curr]?.previousNodeId ?? null;
      if (prev) {
        const requiredWeight = graph.isWeighted
          ? distanceTable[curr].distance - distanceTable[prev].distance
          : 1;

        // Find exact connecting edge matching required weight
        const edge =
          graph.edges.find((e) => {
            const w = graph.isWeighted ? e.weight : 1;
            if (w !== requiredWeight) return false;
            if (graph.isDirected) return e.source === prev && e.target === curr;
            return (
              (e.source === prev && e.target === curr) ||
              (e.source === curr && e.target === prev)
            );
          }) ||
          graph.edges.find((e) => {
            if (graph.isDirected) return e.source === prev && e.target === curr;
            return (
              (e.source === prev && e.target === curr) ||
              (e.source === curr && e.target === prev)
            );
          });

        if (edge) pathEdges.unshift(edge.id);
      }
      curr = prev;
    }

    return { pathNodes, pathEdges };
  }

  function createSnapshot(
    desc: string,
    detail: string,
    codeLine: number,
    type: Step['type'] = 'visit',
    activeNode: string | null = null,
    activeEdge: string | null = null,
    relaxation: RelaxationDetail | null = null,
    overrideShortestPath: { pathNodes: string[]; pathEdges: string[] } | null = null
  ): Step<GraphSnapshot, Record<string, unknown>> {
    const sp =
      overrideShortestPath ||
      (effectiveTarget && distanceTable[effectiveTarget]?.status === 'settled'
        ? getShortestPath(effectiveTarget)
        : null);

    const activeEdgePair: [string, string][] = [];
    if (activeEdge) {
      const e = graph.edges.find((edge) => edge.id === activeEdge);
      if (e) activeEdgePair.push([e.source, e.target]);
    }

    return {
      id: steps.length,
      type,
      description: desc,
      explanationDetail: detail,
      codeLine,
      highlightedNodes: activeNode ? [activeNode] : [],
      highlightedEdges: activeEdgePair,
      state: {
        graph: JSON.parse(JSON.stringify(graph)),
        startNodeId: effectiveStart,
        targetNodeId: effectiveTarget,
        activeNodeId: activeNode,
        activeEdgeId: activeEdge,
        visitedNodes: Array.from(settledNodes),
        traversalOrder: [...traversalOrder],
        distanceTable: cloneDistanceTable(),
        priorityQueue: priorityQueue.map((item) => ({ ...item })),
        relaxationDetail: relaxation ? { ...relaxation } : null,
        shortestPathNodes: sp?.pathNodes || [],
        shortestPathEdges: sp?.pathEdges || [],
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
      `Initialized Dijkstra shortest path from source node (${effectiveStart}).`,
      `Set dist[${effectiveStart}] = 0 and all other nodes to ∞. Enqueued (${effectiveStart}, dist=0) into priority queue.`,
      2,
      'start',
      effectiveStart
    )
  );

  while (priorityQueue.length > 0) {
    iterations++;
    accesses++;

    // Extract min distance node with alphabetical tie-breaking
    priorityQueue.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.nodeId.localeCompare(b.nodeId);
    });
    const { nodeId: u, distance: d } = priorityQueue.shift()!;
    operations++;

    // Skip stale duplicate queue entries
    comparisons++;
    if (d > distanceTable[u].distance) {
      continue;
    }

    // Settle node u
    settledNodes.add(u);
    distanceTable[u].status = 'settled';
    traversalOrder.push(u);

    steps.push(
      createSnapshot(
        `Extracted node (${u}) with minimum distance ${d} from priority queue. Settled permanently.`,
        `By greedy optimality, the shortest path to node (${u}) is finalized as ${d}. Exploring outgoing incident edges.`,
        4,
        'dequeue',
        u
      )
    );

    // Target reached early-exit check
    if (effectiveTarget && u === effectiveTarget) {
      const pathInfo = getShortestPath(effectiveTarget);
      steps.push(
        createSnapshot(
          `Destination target node (${effectiveTarget}) reached! Shortest path cost is ${d}.`,
          `Shortest Path: ${pathInfo.pathNodes.join(' → ')} (Total Cost: ${d}).`,
          5,
          'found',
          u,
          null,
          null,
          pathInfo
        )
      );
      break;
    }

    // Inspect outgoing edges
    const outgoingEdges = graph.edges.filter((e) => {
      if (graph.isDirected) return e.source === u;
      return e.source === u || e.target === u;
    });

    const candidateEdges = outgoingEdges.map((e) => ({
      edge: e,
      neighborId: e.source === u ? e.target : e.source,
      weight: graph.isWeighted ? e.weight : 1,
    }));

    // Sort by neighborId for deterministic execution
    candidateEdges.sort((a, b) => a.neighborId.localeCompare(b.neighborId));

    for (const { edge, neighborId, weight } of candidateEdges) {
      accesses++;
      comparisons++;

      // If already settled, skip
      if (settledNodes.has(neighborId)) {
        steps.push(
          createSnapshot(
            `Neighbor (${neighborId}) is already settled. Skipping edge ${u} → ${neighborId}.`,
            `Permanent shortest distance to (${neighborId}) has already been locked in earlier.`,
            6,
            'visit',
            u,
            edge.id
          )
        );
        continue;
      }

      const oldDist = distanceTable[neighborId].distance;
      const newDist = d + weight;

      if (newDist < oldDist) {
        // Successful Relaxation!
        operations++;
        distanceTable[neighborId].distance = newDist;
        distanceTable[neighborId].previousNodeId = u;
        distanceTable[neighborId].status = 'queued';

        priorityQueue.push({ nodeId: neighborId, distance: newDist });

        const relaxation: RelaxationDetail = {
          u,
          v: neighborId,
          edgeWeight: weight,
          oldDist,
          newDist,
          relaxed: true,
        };

        const oldDistText = oldDist === Number.POSITIVE_INFINITY ? '∞' : String(oldDist);
        steps.push(
          createSnapshot(
            `Relaxed edge ${u} → ${neighborId} (weight ${weight}): distance updated from ${oldDistText} → ${newDist}.`,
            `Relaxation: dist[${u}] (${d}) + weight (${weight}) = ${newDist} < dist[${neighborId}] (${oldDistText}). Updated previous pointer of (${neighborId}) to (${u}).`,
            8,
            'relax',
            neighborId,
            edge.id,
            relaxation
          )
        );
      } else {
        // Failed relaxation
        const relaxation: RelaxationDetail = {
          u,
          v: neighborId,
          edgeWeight: weight,
          oldDist,
          newDist,
          relaxed: false,
        };

        steps.push(
          createSnapshot(
            `No relaxation for edge ${u} → ${neighborId}: path cost ${d} + ${weight} = ${newDist} is not strictly less than existing best distance (${oldDist}).`,
            `Existing shortest path to (${neighborId}) remains superior. Priority queue unchanged.`,
            7,
            'compare',
            u,
            edge.id,
            relaxation
          )
        );
      }
    }
  }

  // Check for unreachable nodes
  const unreachable = Object.values(distanceTable).filter((r) => r.distance === Number.POSITIVE_INFINITY);
  if (unreachable.length > 0) {
    steps.push(
      createSnapshot(
        `Notice: ${unreachable.length} node(s) [${unreachable.map((r) => r.nodeId).join(', ')}] are unreachable from start node (${effectiveStart}) (distance = ∞).`,
        `No directed path exists from (${effectiveStart}) to these vertices.`,
        3,
        'not-found'
      )
    );
  }

  // Final highlight calculation
  let finalPathInfo: { pathNodes: string[]; pathEdges: string[] } | null = null;
  if (effectiveTarget) {
    finalPathInfo = getShortestPath(effectiveTarget);
  } else {
    // If no specific target, highlight all tree edges on the shortest-path spanning forest
    const allSpEdges: string[] = [];
    const allSpNodes = new Set<string>([effectiveStart]);
    for (const [nodeId, row] of Object.entries(distanceTable)) {
      if (row.previousNodeId && row.distance !== Number.POSITIVE_INFINITY) {
        allSpNodes.add(nodeId);
        const edge = graph.edges.find((e) => {
          if (graph.isDirected) return e.source === row.previousNodeId && e.target === nodeId;
          return (
            (e.source === row.previousNodeId && e.target === nodeId) ||
            (e.source === nodeId && e.target === row.previousNodeId)
          );
        });
        if (edge) allSpEdges.push(edge.id);
      }
    }
    finalPathInfo = { pathNodes: Array.from(allSpNodes), pathEdges: allSpEdges };
  }

  // Completion step
  steps.push(
    createSnapshot(
      `Dijkstra execution complete! All reachable vertices settled.`,
      effectiveTarget
        ? `Shortest path from (${effectiveStart}) to (${effectiveTarget}) locked: cost ${distanceTable[effectiveTarget]?.distance ?? '∞'}.`
        : `Single-Source Shortest Path tree fully computed for all ${graph.nodes.length} vertices.`,
      1,
      'complete',
      null,
      null,
      null,
      finalPathInfo
    )
  );

  return steps;
}

export const dijkstraAlgorithm: AlgorithmDefinition<GraphAlgorithmInput, GraphSnapshot, Record<string, unknown>> = {
  id: 'dijkstra',
  name: "Dijkstra's Shortest Path",
  category: 'graphs',
  description: 'Finds the single-source shortest path to all vertices (or a specific destination) in non-negative weighted graphs.',
  realWorldAnalogy: 'GPS in-car satellite navigation calculating the fastest turn-by-turn route around traffic.',
  complexity: dijkstraComplexity,
  pseudocode: dijkstraPseudocode,
  generateSteps: generateDijkstraSteps,
  defaultInput: {
    graph: sampleGraphs.dijkstraRoadmap.data,
    startNodeId: 'A',
    targetNodeId: 'F',
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
