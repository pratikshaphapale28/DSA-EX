import type { TreeNodeData } from '../../types/tree';

/**
 * Computes SVG (x, y) coordinates for binary tree nodes.
 * Canvas width is 640px, height is 340px.
 */
export function computeTreeLayout(
  rootId: string | null,
  nodes: Record<string, TreeNodeData>,
  canvasWidth = 620,
  _canvasHeight = 320
): Record<string, TreeNodeData> {
  if (!rootId || !nodes[rootId]) return { ...nodes };

  const updatedNodes = { ...nodes };

  // Calculate in-order traversal sequence: in a BST/binary tree, in-order ordering guarantees
  // that left children appear strictly to the left and right children strictly to the right.
  const inOrderIds: string[] = [];
  function traverseInOrder(nodeId: string | null) {
    if (!nodeId || !updatedNodes[nodeId]) return;
    traverseInOrder(updatedNodes[nodeId].leftId);
    inOrderIds.push(nodeId);
    traverseInOrder(updatedNodes[nodeId].rightId);
  }
  traverseInOrder(rootId);

  // Guarantee minimum 50px separation between adjacent nodes to prevent any overlaps up to 15+ nodes
  const minSpacing = 50;
  const effectiveWidth = Math.max(canvasWidth, (inOrderIds.length + 1) * minSpacing);
  const horizontalStep = effectiveWidth / (inOrderIds.length + 1);

  function assignCoordinates(nodeId: string | null, depth: number) {
    if (!nodeId || !updatedNodes[nodeId]) return;

    const inOrderIndex = inOrderIds.indexOf(nodeId);
    const node = { ...updatedNodes[nodeId] };
    node.x = Math.round((inOrderIndex + 1) * horizontalStep);
    node.y = Math.round(45 + depth * 58);
    updatedNodes[nodeId] = node;

    if (node.leftId) assignCoordinates(node.leftId, depth + 1);
    if (node.rightId) assignCoordinates(node.rightId, depth + 1);
  }

  assignCoordinates(rootId, 0);
  return updatedNodes;
}

export function computeHeightAndBalance(
  nodeId: string | null,
  nodes: Record<string, TreeNodeData>
): { height: number; balance: number } {
  if (!nodeId || !nodes[nodeId]) {
    return { height: 0, balance: 0 };
  }

  const node = nodes[nodeId];
  const leftInfo = computeHeightAndBalance(node.leftId, nodes);
  const rightInfo = computeHeightAndBalance(node.rightId, nodes);

  const height = 1 + Math.max(leftInfo.height, rightInfo.height);
  const balance = leftInfo.height - rightInfo.height;

  node.height = height;
  node.balanceFactor = balance;

  return { height, balance };
}
