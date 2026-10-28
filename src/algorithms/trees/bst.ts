import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { TreeNodeData, TreeSnapshot } from '../../types/tree';
import { computeTreeLayout, computeHeightAndBalance } from './treeLayout';

export interface BSTOperationInput {
  initialValues: number[];
  operation: {
    type: 'insert' | 'delete' | 'search';
    val: number;
  };
}

const bstPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function bstOperation(root, val):', explanation: 'Binary Search Tree operations' },
  { line: 2, code: '  // INSERT: Traverse down to leaf', explanation: 'Compare with current node' },
  { line: 3, code: '  if val < node.val: node.left = insert(node.left, val)', explanation: 'Go left if value is smaller' },
  { line: 4, code: '  else if val > node.val: node.right = insert(node.right, val)', explanation: 'Go right if value is larger' },
  { line: 5, code: '  else: reject duplicate (strictly unique keys)', explanation: 'Duplicate key detected; set semantics enforced' },
  { line: 6, code: '  // DELETE: Handle 3 structural cases', explanation: 'Case 1: Leaf, Case 2: 1 child, Case 3: 2 children' },
  { line: 7, code: '  if node has 2 children:', explanation: 'Find In-order Successor (smallest node in right subtree)' },
  { line: 8, code: '    successor = findMin(node.right); node.val = successor.val', explanation: 'Replace value with successor' },
  { line: 9, code: '    node.right = delete(node.right, successor.val)', explanation: 'Delete successor from right subtree' },
  { line: 10, code: '  else: replace node with its child (or null if leaf)', explanation: 'Bypass node with single child or null' },
];

const bstComplexity: ComplexityMetric = {
  best: 'O(log N)',
  average: 'O(log N)',
  worst: 'O(N)',
  plainEnglish: 'Average O(log N) when balanced. Worst case O(N) occurs if elements are inserted in sorted order, degenerating into a linked list.',
  space: 'O(N)',
};

export function buildInitialBST(values: number[]): {
  rootId: string | null;
  nodes: Record<string, TreeNodeData>;
} {
  let rootId: string | null = null;
  const nodes: Record<string, TreeNodeData> = {};
  let nextId = 1;

  for (const val of values) {
    if (!rootId) {
      rootId = `node-${nextId++}`;
      nodes[rootId] = {
        id: rootId,
        val,
        leftId: null,
        rightId: null,
        height: 1,
        balanceFactor: 0,
      };
      continue;
    }

    let currId: string | null = rootId;
    while (currId) {
      const curr: TreeNodeData = nodes[currId];
      if (val === curr.val) break; // Ignore duplicates in initial build

      if (val < curr.val) {
        if (!curr.leftId) {
          const newId = `node-${nextId++}`;
          nodes[newId] = {
            id: newId,
            val,
            leftId: null,
            rightId: null,
            height: 1,
            balanceFactor: 0,
          };
          curr.leftId = newId;
          break;
        }
        currId = curr.leftId;
      } else {
        if (!curr.rightId) {
          const newId = `node-${nextId++}`;
          nodes[newId] = {
            id: newId,
            val,
            leftId: null,
            rightId: null,
            height: 1,
            balanceFactor: 0,
          };
          curr.rightId = newId;
          break;
        }
        currId = curr.rightId;
      }
    }
  }

  computeHeightAndBalance(rootId, nodes);
  const layoutNodes = computeTreeLayout(rootId, nodes);
  return { rootId, nodes: layoutNodes };
}

export function generateBSTSteps(input: BSTOperationInput): Step<TreeSnapshot, Record<string, unknown>>[] {
  const { initialValues, operation } = input;
  const steps: Step<TreeSnapshot, Record<string, unknown>>[] = [];

  const initialTree = buildInitialBST(initialValues);
  let rootId = initialTree.rootId;
  const nodes: Record<string, TreeNodeData> = JSON.parse(JSON.stringify(initialTree.nodes));

  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;

  function createSnapshot(
    desc: string,
    detail: string,
    codeLine: number,
    type: Step['type'] = 'visit',
    highlighted: string[] = [],
    searchPath: string[] = []
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
        treeType: 'bst',
        rootId,
        nodes: JSON.parse(JSON.stringify(layout)),
        highlightedNodeIds: [...highlighted],
        searchPathNodeIds: [...searchPath],
        operationType: operation.type,
        targetVal: operation.val,
        duplicatePolicyExplanation: 'Strictly Unique Keys: duplicate insertions are rejected to avoid ambiguous search paths.',
      },
      auxiliaryState: {},
      counters: { comparisons, swaps: 0, iterations, accesses },
    };
  }

  // Initial step
  steps.push(
    createSnapshot(
      `Starting BST operation: ${operation.type.toUpperCase()} value ${operation.val}.`,
      'Binary Search Tree property: for every node, all values in its left subtree are smaller, and all values in its right subtree are larger.',
      1,
      'start'
    )
  );

  const searchPath: string[] = [];

  if (operation.type === 'search' || operation.type === 'insert') {
    let currId = rootId;
    let found = false;

    if (!currId) {
      if (operation.type === 'insert') {
        const newId = `node-${Date.now()}`;
        nodes[newId] = {
          id: newId,
          val: operation.val,
          leftId: null,
          rightId: null,
          height: 1,
          balanceFactor: 0,
        };
        rootId = newId;

        steps.push(
          createSnapshot(
            `Tree was empty. Created root node with value ${operation.val}.`,
            'New root initialized.',
            3,
            'insert',
            [newId]
          )
        );
      } else {
        steps.push(
          createSnapshot(
            `Tree is empty. Target value ${operation.val} not found.`,
            'Search in empty tree terminates immediately.',
            5,
            'not-found'
          )
        );
      }
    } else {
      while (currId) {
        iterations++;
        accesses++;
        comparisons++;
        searchPath.push(currId);
        const curr: TreeNodeData = nodes[currId];

        steps.push(
          createSnapshot(
            `Visiting node (${curr.val}): comparing with target ${operation.val}.`,
            operation.val === curr.val
              ? `Values match! Found target ${operation.val}.`
              : operation.val < curr.val
              ? `${operation.val} < ${curr.val}, branching LEFT.`
              : `${operation.val} > ${curr.val}, branching RIGHT.`,
            operation.val < curr.val ? 3 : 4,
            'compare',
            [currId],
            [...searchPath]
          )
        );

        if (operation.val === curr.val) {
          found = true;
          if (operation.type === 'search') {
            steps.push(
              createSnapshot(
                `Target value ${operation.val} found at node (${curr.val})!`,
                `Search completed successfully along path: [${searchPath.map((id) => nodes[id].val).join(' → ')}].`,
                5,
                'found',
                [currId],
                [...searchPath]
              )
            );
          } else {
            // INSERT DUPLICATE POLICY
            steps.push(
              createSnapshot(
                `⚠️ Duplicate Value Rejected: ${operation.val} already exists in the BST!`,
                'Duplicate Policy: BST maintains strictly unique keys (standard set semantics) to ensure distinct, deterministic search paths.',
                5,
                'not-found',
                [currId],
                [...searchPath]
              )
            );
          }
          break;
        } else if (operation.val < curr.val) {
          if (!curr.leftId) {
            if (operation.type === 'insert') {
              const newId = `node-${Date.now()}`;
              nodes[newId] = {
                id: newId,
                val: operation.val,
                leftId: null,
                rightId: null,
                height: 1,
                balanceFactor: 0,
              };
              curr.leftId = newId;

              steps.push(
                createSnapshot(
                  `Inserted new node (${operation.val}) as the LEFT child of (${curr.val}).`,
                  `Satisfies BST property: ${operation.val} < ${curr.val}.`,
                  3,
                  'insert',
                  [newId],
                  [...searchPath, newId]
                )
              );
            }
            break;
          }
          currId = curr.leftId;
        } else {
          if (!curr.rightId) {
            if (operation.type === 'insert') {
              const newId = `node-${Date.now()}`;
              nodes[newId] = {
                id: newId,
                val: operation.val,
                leftId: null,
                rightId: null,
                height: 1,
                balanceFactor: 0,
              };
              curr.rightId = newId;

              steps.push(
                createSnapshot(
                  `Inserted new node (${operation.val}) as the RIGHT child of (${curr.val}).`,
                  `Satisfies BST property: ${operation.val} > ${curr.val}.`,
                  4,
                  'insert',
                  [newId],
                  [...searchPath, newId]
                )
              );
            }
            break;
          }
          currId = curr.rightId;
        }
      }

      if (!found && operation.type === 'search') {
        steps.push(
          createSnapshot(
            `Reached null leaf pointer. Target value ${operation.val} is not present in the BST.`,
            `Checked path: [${searchPath.map((id) => nodes[id].val).join(' → ')}].`,
            5,
            'not-found',
            [],
            [...searchPath]
          )
        );
      }
    }
  } else if (operation.type === 'delete') {
    // DELETE IMPLEMENTATION HANDLING 3 CASES
    function deleteNode(
      nodeId: string | null,
      val: number
    ): string | null {
      if (!nodeId || !nodes[nodeId]) {
        steps.push(
          createSnapshot(
            `Cannot delete: value ${val} does not exist in the BST.`,
            'Node was not located.',
            10,
            'not-found'
          )
        );
        return null;
      }

      comparisons++;
      const node = nodes[nodeId];
      searchPath.push(nodeId);

      steps.push(
        createSnapshot(
          `Searching for node to delete: inspecting (${node.val}) vs target ${val}.`,
          val === node.val
            ? `Found node (${node.val}) to delete! Evaluating structural cases.`
            : val < node.val
            ? `${val} < ${node.val}, descending LEFT.`
            : `${val} > ${node.val}, descending RIGHT.`,
          val === node.val ? 6 : val < node.val ? 3 : 4,
          'compare',
          [nodeId],
          [...searchPath]
        )
      );

      if (val < node.val) {
        node.leftId = deleteNode(node.leftId, val);
        return nodeId;
      } else if (val > node.val) {
        node.rightId = deleteNode(node.rightId, val);
        return nodeId;
      } else {
        // CASE 1: Leaf Node (0 children)
        if (!node.leftId && !node.rightId) {
          steps.push(
            createSnapshot(
              `Case 1 (Leaf Node): Node (${node.val}) has 0 children. Removing pointer directly.`,
              'A leaf node can be safely deleted without disturbing any subtrees.',
              10,
              'delete',
              [nodeId]
            )
          );
          delete nodes[nodeId];
          return null;
        }

        // CASE 2: One Child (left or right)
        if (!node.leftId || !node.rightId) {
          const childId = node.leftId || node.rightId;
          const child = nodes[childId!];
          steps.push(
            createSnapshot(
              `Case 2 (One Child): Node (${node.val}) has only one child (${child.val}). Replacing node with its child.`,
              'Bypasses the deleted node and connects its single child directly to the parent.',
              10,
              'delete',
              [childId!]
            )
          );
          delete nodes[nodeId];
          return childId;
        }

        // CASE 3: Two Children (Find In-Order Successor)
        steps.push(
          createSnapshot(
            `Case 3 (Two Children): Node (${node.val}) has 2 subtrees. Finding In-Order Successor (smallest value in right subtree).`,
            'In-order successor is the next larger value in sorted order, guaranteed to have at most one child.',
            7,
            'visit',
            [nodeId]
          )
        );

        let successorId = node.rightId!;
        while (nodes[successorId].leftId) {
          successorId = nodes[successorId].leftId!;
        }

        const successor = nodes[successorId];

        steps.push(
          createSnapshot(
            `In-Order Successor identified: node (${successor.val}). The successor's value (${successor.val}) is copied into node (${node.val}), and the successor node is then removed.`,
            `The in-order successor's value (${successor.val}) is copied into node (${node.val}), and the successor node (${successor.val}) is then recursively removed from the right subtree.`,
            8,
            'assign',
            [nodeId, successorId]
          )
        );

        node.val = successor.val;
        node.rightId = deleteNode(node.rightId, successor.val);
        return nodeId;
      }
    }

    rootId = deleteNode(rootId, operation.val);
  }

  // Complete step
  steps.push(
    createSnapshot(
      `BST ${operation.type.toUpperCase()} operation completed successfully.`,
      'Binary Search Tree structure and invariants maintained.',
      1,
      'complete'
    )
  );

  return steps;
}

export const bstAlgorithm: AlgorithmDefinition<BSTOperationInput, TreeSnapshot, Record<string, unknown>> = {
  id: 'bst-ops',
  name: 'Binary Search Tree (BST)',
  category: 'trees',
  description: 'Hierarchical node structure where left < root < right. Demonstrates insert, search path, and 3 delete cases.',
  realWorldAnalogy: 'A library card catalog or a high-low number guessing game where every comparison cuts remaining choices in half.',
  complexity: bstComplexity,
  pseudocode: bstPseudocode,
  generateSteps: generateBSTSteps,
  defaultInput: {
    initialValues: [50, 30, 70, 20, 40, 60, 80],
    operation: { type: 'search', val: 40 },
  },
  sampleInputs: [
    {
      label: 'Search Path Demo',
      input: { initialValues: [50, 30, 70, 20, 40, 60, 80], operation: { type: 'search', val: 40 } },
    },
    {
      label: 'Insert New Value (65)',
      input: { initialValues: [50, 30, 70, 20, 40, 60, 80], operation: { type: 'insert', val: 65 } },
    },
    {
      label: 'Reject Duplicate (50)',
      input: { initialValues: [50, 30, 70, 20, 40, 60, 80], operation: { type: 'insert', val: 50 } },
    },
    {
      label: 'Delete Leaf Node (Case 1: 20)',
      input: { initialValues: [50, 30, 70, 20, 40, 60, 80], operation: { type: 'delete', val: 20 } },
    },
    {
      label: 'Delete 1-Child Node (Case 2: 30)',
      input: { initialValues: [50, 30, 70, 40, 60, 80], operation: { type: 'delete', val: 30 } },
    },
    {
      label: 'Delete 2-Child Root (Case 3: 50)',
      input: { initialValues: [50, 30, 70, 20, 40, 60, 80], operation: { type: 'delete', val: 50 } },
    },
  ],
};
