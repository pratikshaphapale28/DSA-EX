import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { TreeNodeData, TreeSnapshot, AVLRotationType } from '../../types/tree';
import { computeTreeLayout, computeHeightAndBalance } from './treeLayout';

export interface AVLInput {
  initialValues: number[];
  operation: {
    type: 'insert' | 'delete';
    val: number;
  };
}

const avlPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function avlBalance(node):', explanation: 'Self-balancing binary search tree' },
  { line: 2, code: '  bf = height(node.left) - height(node.right)', explanation: 'Compute balance factor on each node' },
  { line: 3, code: '  if bf > 1 and balance(node.left) >= 0: return rightRotate(node) // LL Case', explanation: 'Left-Left: single right rotation' },
  { line: 4, code: '  if bf < -1 and balance(node.right) <= 0: return leftRotate(node) // RR Case', explanation: 'Right-Right: single left rotation' },
  { line: 5, code: '  if bf > 1 and balance(node.left) < 0:', explanation: 'Left-Right: double rotation' },
  { line: 6, code: '    node.left = leftRotate(node.left); return rightRotate(node) // LR Case', explanation: 'Rotate left child left, then rotate node right' },
  { line: 7, code: '  if bf < -1 and balance(node.right) > 0:', explanation: 'Right-Left: double rotation' },
  { line: 8, code: '    node.right = rightRotate(node.right); return leftRotate(node) // RL Case', explanation: 'Rotate right child right, then rotate node left' },
];

const avlComplexity: ComplexityMetric = {
  best: 'O(log N)',
  average: 'O(log N)',
  worst: 'O(log N)',
  plainEnglish: 'Strictly guaranteed O(log N) for all operations because the height of an AVL tree with N nodes is bounded at <= 1.44 log2(N).',
  space: 'O(N)',
};

export function generateAVLSteps(input: AVLInput): Step<TreeSnapshot, Record<string, unknown>>[] {
  const { initialValues, operation } = input;
  const steps: Step<TreeSnapshot, Record<string, unknown>>[] = [];

  let rootId: string | null = null;
  const nodes: Record<string, TreeNodeData> = {};
  let nextIdCounter = 1;

  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;

  function createSnapshot(
    desc: string,
    detail: string,
    codeLine: number,
    type: Step['type'] = 'visit',
    highlighted: string[] = [],
    unbalancedId: string | null = null,
    rotCase: AVLRotationType | null = null,
    rotReason: string | null = null
  ): Step<TreeSnapshot, Record<string, unknown>> {
    computeHeightAndBalance(rootId, nodes);
    const layout = computeTreeLayout(rootId, nodes);

    return {
      id: steps.length,
      type,
      description: desc,
      explanationDetail: detail,
      codeLine,
      state: {
        treeType: 'avl',
        rootId,
        nodes: JSON.parse(JSON.stringify(layout)),
        highlightedNodeIds: [...highlighted],
        unbalancedNodeId: unbalancedId,
        rotationCase: rotCase,
        rotationReason: rotReason,
        operationType: operation.type,
        targetVal: operation.val,
        duplicatePolicyExplanation: 'Strictly Unique Keys: duplicates are rejected in AVL tree.',
      },
      auxiliaryState: {},
      counters: { comparisons, swaps: 0, iterations, accesses },
    };
  }

  function getHeight(nodeId: string | null): number {
    return nodeId && nodes[nodeId] ? nodes[nodeId].height : 0;
  }

  function getBalance(nodeId: string | null): number {
    if (!nodeId || !nodes[nodeId]) return 0;
    return getHeight(nodes[nodeId].leftId) - getHeight(nodes[nodeId].rightId);
  }

  function updateNodeHeight(nodeId: string) {
    const node = nodes[nodeId];
    node.height = 1 + Math.max(getHeight(node.leftId), getHeight(node.rightId));
    node.balanceFactor = getHeight(node.leftId) - getHeight(node.rightId);
  }

  // Single Right Rotation (Clockwise)
  function rotateRight(yId: string, reason: string): string {
    const y = nodes[yId];
    const xId = y.leftId!;
    const x = nodes[xId];
    const T2 = x.rightId;

    // Perform rotation
    x.rightId = yId;
    y.leftId = T2;

    updateNodeHeight(yId);
    updateNodeHeight(xId);

    steps.push(
      createSnapshot(
        `🔄 Right Rotation on node (${y.val}). Node (${x.val}) becomes new subtree root.`,
        reason,
        3,
        'rotate-right',
        [xId, yId],
        null,
        'LL',
        reason
      )
    );

    return xId;
  }

  // Single Left Rotation (Counter-Clockwise)
  function rotateLeft(xId: string, reason: string): string {
    const x = nodes[xId];
    const yId = x.rightId!;
    const y = nodes[yId];
    const T2 = y.leftId;

    // Perform rotation
    y.leftId = xId;
    x.rightId = T2;

    updateNodeHeight(xId);
    updateNodeHeight(yId);

    steps.push(
      createSnapshot(
        `🔄 Left Rotation on node (${x.val}). Node (${y.val}) becomes new subtree root.`,
        reason,
        4,
        'rotate-left',
        [yId, xId],
        null,
        'RR',
        reason
      )
    );

    return yId;
  }

  // Balance helper with causal narration
  function balanceNode(nodeId: string): string {
    updateNodeHeight(nodeId);
    const bf = getBalance(nodeId);
    const node = nodes[nodeId];

    // CASE 1: Left-Left (LL)
    if (bf > 1 && getBalance(node.leftId) >= 0) {
      const leftChild = nodes[node.leftId!];
      const reason = `LL Case: Node (${node.val}) BF = +2, left child (${leftChild.val}) BF = ${leftChild.balanceFactor} >= 0. Resolved with a single Right Rotation.`;
      steps.push(
        createSnapshot(
          `⚠️ Unbalanced Node Detected: (${node.val}) has Balance Factor = +2! [LL Case]`,
          reason,
          3,
          'visit',
          [nodeId],
          nodeId,
          'LL',
          reason
        )
      );
      return rotateRight(nodeId, reason);
    }

    // CASE 2: Right-Right (RR)
    if (bf < -1 && getBalance(node.rightId) <= 0) {
      const rightChild = nodes[node.rightId!];
      const reason = `RR Case: Node (${node.val}) BF = -2, right child (${rightChild.val}) BF = ${rightChild.balanceFactor} <= 0. Resolved with a single Left Rotation.`;
      steps.push(
        createSnapshot(
          `⚠️ Unbalanced Node Detected: (${node.val}) has Balance Factor = -2! [RR Case]`,
          reason,
          4,
          'visit',
          [nodeId],
          nodeId,
          'RR',
          reason
        )
      );
      return rotateLeft(nodeId, reason);
    }

    // CASE 3: Left-Right (LR)
    if (bf > 1 && getBalance(node.leftId) < 0) {
      const leftChild = nodes[node.leftId!];
      const reason = `LR Case: Node (${node.val}) BF = +2, but left child (${leftChild.val}) BF = -1 (zigzag). First Left-Rotate left child, then Right-Rotate node.`;
      steps.push(
        createSnapshot(
          `⚠️ Unbalanced Node Detected: (${node.val}) has Balance Factor = +2! [LR Case: Zigzag]`,
          reason,
          5,
          'visit',
          [nodeId],
          nodeId,
          'LR',
          reason
        )
      );
      // Step 1: Left rotate left child
      node.leftId = rotateLeft(node.leftId!, 'LR Step 1: Left rotation on left child to convert zigzag into straight line.');
      // Step 2: Right rotate current node
      return rotateRight(nodeId, 'LR Step 2: Right rotation on root to complete re-balancing.');
    }

    // CASE 4: Right-Left (RL)
    if (bf < -1 && getBalance(node.rightId) > 0) {
      const rightChild = nodes[node.rightId!];
      const reason = `RL Case: Node (${node.val}) BF = -2, but right child (${rightChild.val}) BF = +1 (zigzag). First Right-Rotate right child, then Left-Rotate node.`;
      steps.push(
        createSnapshot(
          `⚠️ Unbalanced Node Detected: (${node.val}) has Balance Factor = -2! [RL Case: Zigzag]`,
          reason,
          7,
          'visit',
          [nodeId],
          nodeId,
          'RL',
          reason
        )
      );
      // Step 1: Right rotate right child
      node.rightId = rotateRight(node.rightId!, 'RL Step 1: Right rotation on right child to convert zigzag into straight line.');
      // Step 2: Left rotate current node
      return rotateLeft(nodeId, 'RL Step 2: Left rotation on root to complete re-balancing.');
    }

    return nodeId;
  }

  // Insert helper
  function insertAVL(currId: string | null, val: number, recordSteps = true): string {
    if (!currId) {
      const newId = `node-${nextIdCounter++}`;
      nodes[newId] = {
        id: newId,
        val,
        leftId: null,
        rightId: null,
        height: 1,
        balanceFactor: 0,
      };
      if (recordSteps) {
        steps.push(
          createSnapshot(
            `Inserted node (${val}).`,
            'Node created. Now checking ancestor balance factors on the way up.',
            2,
            'insert',
            [newId]
          )
        );
      }
      return newId;
    }

    comparisons++;
    accesses++;
    const curr = nodes[currId];

    if (val < curr.val) {
      curr.leftId = insertAVL(curr.leftId, val, recordSteps);
    } else if (val > curr.val) {
      curr.rightId = insertAVL(curr.rightId, val, recordSteps);
    } else {
      // Duplicate rejected
      if (recordSteps) {
        steps.push(
          createSnapshot(
            `Duplicate value ${val} rejected: AVL maintains strictly unique keys.`,
            'No insertion performed.',
            2,
            'not-found',
            [currId]
          )
        );
      }
      return currId;
    }

    return balanceNode(currId);
  }

  // Delete helper
  function deleteAVL(currId: string | null, val: number): string | null {
    if (!currId || !nodes[currId]) {
      steps.push(
        createSnapshot(`Value ${val} not found in AVL tree.`, 'Cannot delete absent key.', 1, 'not-found')
      );
      return null;
    }

    comparisons++;
    accesses++;
    const curr = nodes[currId];

    if (val < curr.val) {
      curr.leftId = deleteAVL(curr.leftId, val);
    } else if (val > curr.val) {
      curr.rightId = deleteAVL(curr.rightId, val);
    } else {
      // Found node to delete
      // Case 1 or 2: 0 or 1 child
      if (!curr.leftId || !curr.rightId) {
        const temp = curr.leftId || curr.rightId;
        if (!temp) {
          // Leaf node
          steps.push(
            createSnapshot(
              `Deleted leaf node (${curr.val}).`,
              'Leaf removed. Now re-balancing ancestors up to root.',
              1,
              'delete',
              [currId]
            )
          );
          delete nodes[currId];
          return null;
        } else {
          // One child
          steps.push(
            createSnapshot(
              `Deleted node (${curr.val}) with one child (${nodes[temp].val}).`,
              'Replacing node with its single child.',
              1,
              'delete',
              [temp]
            )
          );
          delete nodes[currId];
          return temp;
        }
      } else {
        // Case 3: 2 children -> in-order successor
        let successorId = curr.rightId!;
        while (nodes[successorId].leftId) {
          successorId = nodes[successorId].leftId!;
        }
        const successor = nodes[successorId];

        steps.push(
          createSnapshot(
            `Node (${curr.val}) has 2 children. The successor's value (${successor.val}) is copied into node (${curr.val}), and the successor node is then removed.`,
            `The in-order successor's value (${successor.val}) is copied into node (${curr.val}), and the successor node (${successor.val}) is then recursively removed from the right subtree.`,
            1,
            'assign',
            [currId, successorId]
          )
        );

        curr.val = successor.val;
        curr.rightId = deleteAVL(curr.rightId, successor.val);
      }
    }

    return balanceNode(currId);
  }

  // Build initial tree silently
  for (const v of initialValues) {
    rootId = insertAVL(rootId, v, false);
  }

  // Initial step of current operation
  steps.push(
    createSnapshot(
      `Starting AVL ${operation.type.toUpperCase()} operation for value ${operation.val}.`,
      'AVL invariant: Balance Factor on every node must remain in {-1, 0, +1}. Any deviation triggers self-balancing rotations.',
      1,
      'start'
    )
  );

  if (operation.type === 'insert') {
    rootId = insertAVL(rootId, operation.val, true);
  } else {
    rootId = deleteAVL(rootId, operation.val);
  }

  // Complete step
  steps.push(
    createSnapshot(
      `AVL ${operation.type.toUpperCase()} complete! All nodes strictly balanced: BF ∈ {-1, 0, +1}.`,
      'Height remains logarithmic O(log N).',
      1,
      'complete'
    )
  );

  return steps;
}

export const avlAlgorithm: AlgorithmDefinition<AVLInput, TreeSnapshot, Record<string, unknown>> = {
  id: 'avl-tree',
  name: 'AVL Tree (Self-Balancing)',
  category: 'trees',
  description: 'Self-balancing binary search tree maintaining balance factors in [-1, +1] via LL, RR, LR, and RL rotations.',
  realWorldAnalogy: 'A mechanical scale or acrobatic balance troupe: any weight imbalance is immediately counterbalanced.',
  complexity: avlComplexity,
  pseudocode: avlPseudocode,
  generateSteps: generateAVLSteps,
  defaultInput: {
    initialValues: [30, 20, 40, 10, 25],
    operation: { type: 'insert', val: 5 }, // Triggers LL rotation
  },
  sampleInputs: [
    {
      label: 'LL Rotation Case (Insert 5)',
      input: { initialValues: [30, 20, 40, 10, 25], operation: { type: 'insert', val: 5 } },
    },
    {
      label: 'RR Rotation Case (Insert 50)',
      input: { initialValues: [20, 10, 30, 25, 40], operation: { type: 'insert', val: 50 } },
    },
    {
      label: 'LR Rotation Case (Insert 28)',
      input: { initialValues: [40, 20, 50, 10, 25], operation: { type: 'insert', val: 28 } },
    },
    {
      label: 'RL Rotation Case (Insert 35)',
      input: { initialValues: [20, 10, 40, 30, 50], operation: { type: 'insert', val: 35 } },
    },
    {
      label: 'Delete Causing Rebalance (Delete 10)',
      input: { initialValues: [30, 20, 40, 10, 25, 35, 50], operation: { type: 'delete', val: 10 } },
    },
    {
      label: 'Delete with RR Rotation (Delete 2)',
      input: { initialValues: [4, 2, 6, 5, 7], operation: { type: 'delete', val: 2 } },
    },
    {
      label: 'Delete with LL Rotation (Delete 6)',
      input: { initialValues: [4, 2, 6, 1, 3], operation: { type: 'delete', val: 6 } },
    },
  ],
};
