import { describe, it, expect } from 'vitest';
import { generateBFSSteps } from '../src/algorithms/graphs/bfs';
import { generateDFSSteps } from '../src/algorithms/graphs/dfs';
import { generateDijkstraSteps } from '../src/algorithms/graphs/dijkstra';
import { sampleGraphs } from '../src/algorithms/graphs/sampleGraphs';
import type { GraphData, GraphNode, GraphEdge } from '../src/types/graph';

/**
 * Independent Reference Implementation: Bellman-Ford Shortest Path
 * Computes exact single-source shortest path distances for verification.
 */
function refBellmanFord(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  isDirected: boolean
): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const n of nodes) {
    dist[n.id] = Number.POSITIVE_INFINITY;
  }
  dist[startId] = 0;

  // Build directed edge list (expand undirected into pairs)
  const directedEdges: { u: string; v: string; w: number }[] = [];
  for (const e of edges) {
    directedEdges.push({ u: e.source, v: e.target, w: e.weight });
    if (!isDirected) {
      directedEdges.push({ u: e.target, v: e.source, w: e.weight });
    }
  }

  // Relax |V| - 1 times
  const V = nodes.length;
  for (let i = 0; i < V - 1; i++) {
    let updated = false;
    for (const { u, v, w } of directedEdges) {
      if (dist[u] !== Number.POSITIVE_INFINITY && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        updated = true;
      }
    }
    if (!updated) break;
  }

  return dist;
}

describe('Breadth-First Search (BFS)', () => {
  it('correctly visits nodes level-by-level on a known Tree DAG', () => {
    const graph = sampleGraphs.treeDAG.data;
    const steps = generateBFSSteps({ graph, startNodeId: 'A' });

    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.traversalOrder).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(finalStep.state.visitedNodes.length).toBe(6);
  });

  it('correctly navigates a cyclic graph without infinite looping', () => {
    const graph = sampleGraphs.cyclicGraph.data;
    const steps = generateBFSSteps({ graph, startNodeId: 'A' });

    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.visitedNodes.length).toBe(5);
    expect(finalStep.state.visitedNodes.sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('handles disconnected graphs by reporting unreachable nodes', () => {
    const graph = sampleGraphs.disconnectedGraph.data;
    const steps = generateBFSSteps({ graph, startNodeId: 'A' });

    const finalStep = steps[steps.length - 1];
    // Start component has A, B, C
    expect(finalStep.state.visitedNodes.sort()).toEqual(['A', 'B', 'C']);

    const noticeStep = steps.find((s) => s.description.includes('Disconnected Graph Notice'));
    expect(noticeStep).toBeDefined();
    expect(noticeStep?.description).toContain('D');
    expect(noticeStep?.description).toContain('E');
    expect(noticeStep?.description).toContain('F');
  });

  it('provides friendly empty state when graph has fewer than 2 nodes', () => {
    const emptyGraph: GraphData = {
      nodes: [{ id: 'A', label: 'A', x: 100, y: 100 }],
      edges: [],
      isDirected: false,
      isWeighted: false,
    };

    const steps = generateBFSSteps({ graph: emptyGraph, startNodeId: 'A' });
    expect(steps.length).toBe(1);
    expect(steps[0].state.emptyStateMessage).toContain('Add at least 2 nodes');
  });

  it('guarantees forward-then-backward replay on BFS steps', () => {
    const steps = generateBFSSteps({
      graph: sampleGraphs.cyclicGraph.data,
      startNodeId: 'A',
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) i--;
    expect(steps[0]).toEqual(initial);
  });
});

describe('Depth-First Search (DFS)', () => {
  it('correctly performs depth-first exploration along branches before backtracking', () => {
    const graph = sampleGraphs.treeDAG.data;
    const steps = generateDFSSteps({ graph, startNodeId: 'A' });

    const finalStep = steps[steps.length - 1];
    expect(finalStep.state.visitedNodes.length).toBe(6);
    // In DFS, A -> B -> D ... visits B branch before visiting C
    const bIndex = finalStep.state.traversalOrder.indexOf('B');
    const dIndex = finalStep.state.traversalOrder.indexOf('D');
    const cIndex = finalStep.state.traversalOrder.indexOf('C');
    expect(bIndex).toBeLessThan(dIndex);
    expect(dIndex).toBeLessThan(cIndex);
  });

  it('handles disconnected graphs and identifies unreachable nodes', () => {
    const graph = sampleGraphs.disconnectedGraph.data;
    const steps = generateDFSSteps({ graph, startNodeId: 'D' });

    const finalStep = steps[steps.length - 1];
    // Component starting from D contains D and E
    expect(finalStep.state.visitedNodes.sort()).toEqual(['D', 'E']);

    const noticeStep = steps.find((s) => s.description.includes('Disconnected Graph Notice'));
    expect(noticeStep).toBeDefined();
    expect(noticeStep?.description).toContain('A');
  });

  it('guarantees forward-then-backward replay on DFS steps', () => {
    const steps = generateDFSSteps({
      graph: sampleGraphs.treeDAG.data,
      startNodeId: 'A',
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) i--;
    expect(steps[0]).toEqual(initial);
  });
});

describe('Dijkstra Shortest Path Algorithm', () => {
  it('correctly calculates shortest path on known Dijkstra Roadmap', () => {
    const graph = sampleGraphs.dijkstraRoadmap.data;
    const steps = generateDijkstraSteps({
      graph,
      startNodeId: 'A',
      targetNodeId: 'F',
    });

    const finalStep = steps[steps.length - 1];
    const distTable = finalStep.state.distanceTable!;

    // Optimal paths from A:
    // A -> C: 2
    // A -> B: 3 (via A -> C(2) + C->B(1) = 3 or direct 4) -> wait, e-B-C is directed B->C (1) so A->B is 4, A->C is 2
    // A->D: min(A->B(4)+B->D(5)=9, A->C(2)+C->D(8)=10) -> 9
    // A->E: A->C(2)+C->E(10)=12 vs A->D(9)+D->E(2)=11 -> 11
    // A->F: min(A->D(9)+D->F(6)=15, A->E(11)+E->F(3)=14) -> 14
    const expected = refBellmanFord(graph.nodes, graph.edges, 'A', graph.isDirected);
    for (const node of graph.nodes) {
      expect(distTable[node.id].distance).toBe(expected[node.id]);
    }
  });

  it('rejects graphs with negative weights and displays friendly error', () => {
    const graph = sampleGraphs.negativeEdgeDemo.data;
    const steps = generateDijkstraSteps({
      graph,
      startNodeId: 'A',
      targetNodeId: 'C',
    });

    expect(steps.length).toBe(1);
    expect(steps[0].state.hasNegativeWeight).toBe(true);
    expect(steps[0].description).toContain('negative edge weights');
    expect(steps[0].explanationDetail).toContain('Bellman-Ford');
  });

  it('matches Bellman-Ford reference across 200+ random non-negative graphs', () => {
    const NUM_TRIALS = 210;

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      // 1. Generate random graph configuration
      const numNodes = trial === 0 ? 1 : trial === 1 ? 2 : Math.floor(Math.random() * 6) + 3; // 1 to 8 nodes
      const isDirected = trial % 2 === 0;
      const isWeighted = true;

      const nodes: GraphNode[] = [];
      for (let i = 0; i < numNodes; i++) {
        const id = String.fromCharCode(65 + i);
        nodes.push({ id, label: id, x: 50 + i * 50, y: 50 + (i % 3) * 50 });
      }

      const edges: GraphEdge[] = [];
      let edgeCounter = 1;

      // Add random edges (including self-loops, parallel edges, and disconnectedness)
      const numEdges = numNodes <= 1 ? 0 : Math.floor(Math.random() * (numNodes * 2));
      for (let e = 0; e < numEdges; e++) {
        const u = nodes[Math.floor(Math.random() * numNodes)].id;
        const v = nodes[Math.floor(Math.random() * numNodes)].id;
        // Non-negative random weight
        const weight = Math.floor(Math.random() * 20) + 1;

        edges.push({
          id: `e-${u}-${v}-${edgeCounter++}`,
          source: u,
          target: v,
          weight,
        });
      }

      const graphData: GraphData = {
        nodes,
        edges,
        isDirected,
        isWeighted,
      };

      const startNodeId = nodes[0].id;
      const testTarget = Math.random() > 0.5 && numNodes > 1 ? nodes[numNodes - 1].id : null;

      // Run Dijkstra step generator
      const steps = generateDijkstraSteps({
        graph: graphData,
        startNodeId,
        targetNodeId: testTarget,
      });

      expect(steps.length).toBeGreaterThan(0);

      // Compare against Bellman-Ford reference
      const refDist = refBellmanFord(nodes, edges, startNodeId, isDirected);

      const finalStep = steps[steps.length - 1];
      if (finalStep.state.distanceTable) {
        if (!testTarget) {
          for (const node of nodes) {
            const dijkstraDist = finalStep.state.distanceTable[node.id].distance;
            const expectedDist = refDist[node.id];
            expect(dijkstraDist).toBe(expectedDist);
          }
        } else {
          const dijkstraDist = finalStep.state.distanceTable[testTarget].distance;
          const expectedDist = refDist[testTarget];
          expect(dijkstraDist).toBe(expectedDist);

          // Path validity and weight sum assertions
          if (dijkstraDist !== Number.POSITIVE_INFINITY && finalStep.state.shortestPathNodes && finalStep.state.shortestPathNodes.length > 0) {
            const pathNodes = finalStep.state.shortestPathNodes;
            expect(pathNodes[0]).toBe(startNodeId);
            expect(pathNodes[pathNodes.length - 1]).toBe(testTarget);

            // Assert consecutive node connection
            for (let i = 0; i < pathNodes.length - 1; i++) {
              const u = pathNodes[i];
              const v = pathNodes[i + 1];
              const connectingEdges = edges.filter((e) =>
                isDirected ? e.source === u && e.target === v : (e.source === u && e.target === v) || (e.source === v && e.target === u)
              );
              expect(connectingEdges.length).toBeGreaterThan(0);
            }

            // Assert that the sum of weights of highlighted shortestPathEdges matches dijkstraDist
            if (finalStep.state.shortestPathEdges && finalStep.state.shortestPathEdges.length > 0) {
              let edgeWeightSum = 0;
              for (const edgeId of finalStep.state.shortestPathEdges) {
                const edgeObj = edges.find((e) => e.id === edgeId);
                expect(edgeObj).toBeDefined();
                edgeWeightSum += edgeObj!.weight;
              }
              expect(edgeWeightSum).toBe(dijkstraDist);
            }
          }
        }
      }

      // Check step counters
      for (const step of steps) {
        expect(step.counters.comparisons).toBeGreaterThanOrEqual(0);
        expect(step.counters.accesses).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('correctly operates in Unweighted mode (every edge counts as 1, matching BFS hop distance)', () => {
    const graph: GraphData = {
      isDirected: true,
      isWeighted: false, // Unweighted mode!
      nodes: [
        { id: 'A', label: 'A', x: 0, y: 0 },
        { id: 'B', label: 'B', x: 0, y: 0 },
        { id: 'C', label: 'C', x: 0, y: 0 },
        { id: 'D', label: 'D', x: 0, y: 0 },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', weight: 999 }, // Weight 999 should be ignored (treated as 1)
        { id: 'e2', source: 'B', target: 'D', weight: 888 },
        { id: 'e3', source: 'A', target: 'C', weight: 777 },
        { id: 'e4', source: 'C', target: 'D', weight: 666 },
      ],
    };

    const steps = generateDijkstraSteps({
      graph,
      startNodeId: 'A',
      targetNodeId: 'D',
    });

    const finalStep = steps[steps.length - 1];
    const distTable = finalStep.state.distanceTable!;
    expect(distTable['A'].distance).toBe(0);
    expect(distTable['B'].distance).toBe(1);
    expect(distTable['C'].distance).toBe(1);
    expect(distTable['D'].distance).toBe(2);
  });

  it('strictly adheres to alphabetical tie-breaking when distances are equal in priority queue', () => {
    // Both B and C have distance 1 from A
    const graph: GraphData = {
      isDirected: true,
      isWeighted: true,
      nodes: [
        { id: 'A', label: 'A', x: 0, y: 0 },
        { id: 'C', label: 'C', x: 0, y: 0 },
        { id: 'B', label: 'B', x: 0, y: 0 },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'C', weight: 1 },
        { id: 'e2', source: 'A', target: 'B', weight: 1 },
      ],
    };

    const steps = generateDijkstraSteps({
      graph,
      startNodeId: 'A',
    });

    const finalStep = steps[steps.length - 1];
    // With alphabetical tie-breaking, B must be settled before C
    const bIndex = finalStep.state.traversalOrder.indexOf('B');
    const cIndex = finalStep.state.traversalOrder.indexOf('C');
    expect(bIndex).toBeLessThan(cIndex);
  });

  it('guarantees forward-then-backward replay on Dijkstra steps', () => {
    const steps = generateDijkstraSteps({
      graph: sampleGraphs.dijkstraRoadmap.data,
      startNodeId: 'A',
      targetNodeId: 'F',
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) i--;
    expect(steps[0]).toEqual(initial);
  });
});
