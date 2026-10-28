export interface TreeNodeData {
  id: string;
  val: number;
  leftId: string | null;
  rightId: string | null;
  height: number;
  balanceFactor: number; // height(left) - height(right)
  x?: number;
  y?: number;
}

export type AVLRotationType = 'LL' | 'RR' | 'LR' | 'RL';

export interface TreeSnapshot {
  treeType: 'bst' | 'avl';
  rootId: string | null;
  nodes: Record<string, TreeNodeData>;
  highlightedNodeIds: string[];
  searchPathNodeIds?: string[];
  unbalancedNodeId?: string | null;
  rotationCase?: AVLRotationType | null;
  rotationReason?: string | null;
  traversalOutput?: number[];
  traversalType?: 'inorder' | 'preorder' | 'postorder' | 'levelorder';
  operationType?: 'insert' | 'delete' | 'search' | 'traversal';
  targetVal?: number;
  duplicatePolicyExplanation?: string;
}
