import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { TreeSnapshot } from '../../types/tree';
import { buildInitialBST } from './bst';
import { computeTreeLayout, computeHeightAndBalance } from './treeLayout';

export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

export interface TraversalInput {
  initialValues: number[];
  traversalType: TraversalType;
}

const traversalPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function traverse(root, type):', explanation: 'Tree traversal routines' },
  { line: 2, code: '  // IN-ORDER: Left -> Root -> Right', explanation: 'Yields non-decreasing sorted order on a BST' },
  { line: 3, code: '  inorder(node.left); visit(node); inorder(node.right)', explanation: 'Recursive in-order' },
  { line: 4, code: '  // PRE-ORDER: Root -> Left -> Right', explanation: 'Visits root before its children (useful for cloning/serialization)' },
  { line: 5, code: '  visit(node); preorder(node.left); preorder(node.right)', explanation: 'Recursive pre-order' },
  { line: 6, code: '  // POST-ORDER: Left -> Right -> Root', explanation: 'Visits children before root (useful for bottom-up deletions)' },
  { line: 7, code: '  postorder(node.left); postorder(node.right); visit(node)', explanation: 'Recursive post-order' },
  { line: 8, code: '  // LEVEL-ORDER: Breadth-First using FIFO Queue', explanation: 'Visits nodes level by level from top to bottom' },
  { line: 9, code: '  queue = [root]; while queue: node = queue.dequeue(); visit(node)', explanation: 'FIFO queue traversal' },
];

const traversalComplexity: ComplexityMetric = {
  best: 'O(N)',
  average: 'O(N)',
  worst: 'O(N)',
  plainEnglish: 'Visits every node exactly once, resulting in O(N) time complexity where N is the total number of nodes.',
  space: 'O(N)',
};

export function generateTraversalSteps(input: TraversalInput): Step<TreeSnapshot, Record<string, unknown>>[] {
  const { initialValues, traversalType } = input;
  const steps: Step<TreeSnapshot, Record<string, unknown>>[] = [];

  const tree = buildInitialBST(initialValues);
  const rootId = tree.rootId;
  const nodes = tree.nodes;

  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;

  const outputSequence: number[] = [];

  function createSnapshot(
    desc: string,
    detail: string,
    codeLine: number,
    highlighted: string[] = []
  ): Step<TreeSnapshot, Record<string, unknown>> {
    computeHeightAndBalance(rootId, nodes);
    const layout = computeTreeLayout(rootId, nodes);

    return {
      id: steps.length,
      type: 'visit',
      description: desc,
      explanationDetail: detail,
      codeLine,
      state: {
        treeType: 'bst',
        rootId,
        nodes: JSON.parse(JSON.stringify(layout)),
        highlightedNodeIds: [...highlighted],
        traversalOutput: [...outputSequence],
        traversalType,
        operationType: 'traversal',
      },
      auxiliaryState: {},
      counters: { comparisons, swaps: 0, iterations, accesses },
    };
  }

  // Initial step
  steps.push(
    createSnapshot(
      `Starting ${traversalType.toUpperCase()} traversal on tree of ${Object.keys(nodes).length} node(s).`,
      traversalType === 'inorder'
        ? 'In-order traversal visits (Left, Root, Right). On a BST, it produces a strictly non-decreasing sorted sequence.'
        : traversalType === 'preorder'
        ? 'Pre-order traversal visits (Root, Left, Right). The root appears first.'
        : traversalType === 'postorder'
        ? 'Post-order traversal visits (Left, Right, Root). The root appears last.'
        : 'Level-order traversal visits nodes level by level from top to bottom using a FIFO queue.',
      1
    )
  );

  if (!rootId) {
    steps.push(
      createSnapshot('Tree is empty. Traversal sequence is empty.', 'Nothing to visit.', 1)
    );
    return steps;
  }

  if (traversalType === 'inorder') {
    function inorder(nodeId: string | null) {
      if (!nodeId || !nodes[nodeId]) return;
      iterations++;
      accesses++;

      inorder(nodes[nodeId].leftId);

      const node = nodes[nodeId];
      outputSequence.push(node.val);

      steps.push(
        createSnapshot(
          `Visited node (${node.val}). Added to in-order output sequence.`,
          `Left subtree completed. Now recording root value ${node.val} before descending right.`,
          3,
          [nodeId]
        )
      );

      inorder(nodes[nodeId].rightId);
    }
    inorder(rootId);
  } else if (traversalType === 'preorder') {
    function preorder(nodeId: string | null) {
      if (!nodeId || !nodes[nodeId]) return;
      iterations++;
      accesses++;

      const node = nodes[nodeId];
      outputSequence.push(node.val);

      steps.push(
        createSnapshot(
          `Visited root node (${node.val}) first. Added to pre-order output.`,
          `Root visited before descending into left or right subtrees.`,
          5,
          [nodeId]
        )
      );

      preorder(nodes[nodeId].leftId);
      preorder(nodes[nodeId].rightId);
    }
    preorder(rootId);
  } else if (traversalType === 'postorder') {
    function postorder(nodeId: string | null) {
      if (!nodeId || !nodes[nodeId]) return;
      iterations++;
      accesses++;

      postorder(nodes[nodeId].leftId);
      postorder(nodes[nodeId].rightId);

      const node = nodes[nodeId];
      outputSequence.push(node.val);

      steps.push(
        createSnapshot(
          `Visited node (${node.val}) after both its left and right subtrees.`,
          `Both subtrees completed. Now recording node value ${node.val}.`,
          7,
          [nodeId]
        )
      );
    }
    postorder(rootId);
  } else if (traversalType === 'levelorder') {
    const queue: string[] = [rootId];

    while (queue.length > 0) {
      iterations++;
      accesses++;
      const currId = queue.shift()!;
      const curr = nodes[currId];
      outputSequence.push(curr.val);

      steps.push(
        createSnapshot(
          `Dequeued and visited node (${curr.val}) in level-order.`,
          `Breadth-first expansion: Enqueuing available children.`,
          9,
          [currId]
        )
      );

      if (curr.leftId) queue.push(curr.leftId);
      if (curr.rightId) queue.push(curr.rightId);
    }
  }

  // Complete step
  steps.push(
    createSnapshot(
      `${traversalType.toUpperCase()} traversal complete! Final output: [${outputSequence.join(', ')}].`,
      'All nodes visited.',
      1
    )
  );

  return steps;
}

export const traversalsAlgorithm: AlgorithmDefinition<TraversalInput, TreeSnapshot, Record<string, unknown>> = {
  id: 'tree-traversals',
  name: 'Tree Traversals',
  category: 'trees',
  description: 'Systematically visits every node in the tree using In-Order, Pre-Order, Post-Order, or Level-Order.',
  realWorldAnalogy: 'Navigating an organizational directory: visiting departments before employees (pre-order) or rolling up budget numbers from teams to CEO (post-order).',
  complexity: traversalComplexity,
  pseudocode: traversalPseudocode,
  generateSteps: generateTraversalSteps,
  defaultInput: {
    initialValues: [50, 30, 70, 20, 40, 60, 80],
    traversalType: 'inorder',
  },
  sampleInputs: [
    { label: 'In-Order (Sorted Sequence)', input: { initialValues: [50, 30, 70, 20, 40, 60, 80], traversalType: 'inorder' } },
    { label: 'Pre-Order (Root First)', input: { initialValues: [50, 30, 70, 20, 40, 60, 80], traversalType: 'preorder' } },
    { label: 'Post-Order (Root Last)', input: { initialValues: [50, 30, 70, 20, 40, 60, 80], traversalType: 'postorder' } },
    { label: 'Level-Order (Breadth-First)', input: { initialValues: [50, 30, 70, 20, 40, 60, 80], traversalType: 'levelorder' } },
  ],
};
