import type { GraphData, GraphNode, GraphEdge } from '../../types/graph';

/**
 * Serializes a graph to a plain text edge list.
 * E.g.:
 * A B 4
 * B C 2
 * F
 */
export function serializeEdgeList(graph: GraphData): string {
  const lines: string[] = [];
  const connectedNodeIds = new Set<string>();

  for (const edge of graph.edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
    if (graph.isWeighted) {
      lines.push(`${edge.source} ${edge.target} ${edge.weight}`);
    } else {
      lines.push(`${edge.source} ${edge.target}`);
    }
  }

  // Include isolated nodes on single lines
  for (const node of graph.nodes) {
    if (!connectedNodeIds.has(node.id)) {
      lines.push(node.id);
    }
  }

  return lines.join('\n');
}

/**
 * Parses a plain text edge list into GraphData.
 * Automatically generates circular layout coordinates for nodes.
 */
export function parseEdgeList(
  text: string,
  isDirected: boolean,
  isWeighted: boolean
): GraphData {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  let edgeIdCounter = 1;

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length === 1) {
      // Single isolated node declaration
      const id = parts[0].toUpperCase();
      if (!nodeMap.has(id)) {
        nodeMap.set(id, { id, label: id, x: 0, y: 0 });
      }
    } else if (parts.length >= 2) {
      const u = parts[0].toUpperCase();
      const v = parts[1].toUpperCase();
      const w = parts.length >= 3 && !isNaN(Number(parts[2])) ? Number(parts[2]) : 1;

      if (!nodeMap.has(u)) nodeMap.set(u, { id: u, label: u, x: 0, y: 0 });
      if (!nodeMap.has(v)) nodeMap.set(v, { id: v, label: v, x: 0, y: 0 });

      edges.push({
        id: `e-${u}-${v}-${edgeIdCounter++}`,
        source: u,
        target: v,
        weight: isWeighted ? w : 1,
      });
    }
  }

  const nodes = Array.from(nodeMap.values());
  const count = nodes.length;

  // Arrange nodes in an aesthetic circle or ellipse
  const centerX = 300;
  const centerY = 170;
  const radiusX = Math.min(220, count * 35 + 80);
  const radiusY = Math.min(130, count * 25 + 60);

  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(1, count) - Math.PI / 2;
    node.x = Math.round(centerX + radiusX * Math.cos(angle));
    node.y = Math.round(centerY + radiusY * Math.sin(angle));
  });

  return {
    nodes,
    edges,
    isDirected,
    isWeighted,
  };
}
