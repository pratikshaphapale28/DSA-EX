export interface GraphNode {
  id: string; // e.g. 'A', 'B', 'C'
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
  isWeighted: boolean;
}

export interface DistanceTableRow {
  nodeId: string;
  distance: number; // Number.POSITIVE_INFINITY if unreachable
  previousNodeId: string | null;
  status: 'unvisited' | 'queued' | 'settled';
}

export interface PriorityQueueItem {
  nodeId: string;
  distance: number;
}

export interface RelaxationDetail {
  u: string;
  v: string;
  edgeWeight: number;
  oldDist: number;
  newDist: number;
  relaxed: boolean;
}

export interface GraphSnapshot {
  graph: GraphData;
  startNodeId: string;
  targetNodeId?: string | null;
  activeNodeId?: string | null;
  activeEdgeId?: string | null;
  visitedNodes: string[];
  queue?: string[]; // For BFS
  stack?: string[]; // For DFS
  traversalOrder: string[];
  distanceTable?: Record<string, DistanceTableRow>;
  priorityQueue?: PriorityQueueItem[];
  relaxationDetail?: RelaxationDetail | null;
  shortestPathEdges?: string[]; // Edge IDs on shortest path
  shortestPathNodes?: string[]; // Node IDs on shortest path
  hasNegativeWeight?: boolean;
  negativeWeightErrorMessage?: string | null;
  emptyStateMessage?: string | null;
}

export interface GraphAlgorithmInput {
  graph: GraphData;
  startNodeId: string;
  targetNodeId?: string | null;
}
