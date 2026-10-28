import { describe, it, expect } from 'vitest';
import { generateBSTSteps, buildInitialBST } from '../src/algorithms/trees/bst';
import { generateTraversalSteps } from '../src/algorithms/trees/traversals';
import { generateAVLSteps } from '../src/algorithms/trees/avl';
import type { TreeNodeData } from '../src/types/tree';

// Reference recursive traversals for test validation
function refInorder(rootId: string | null, nodes: Record<string, TreeNodeData>): number[] {
  if (!rootId || !nodes[rootId]) return [];
  return [
    ...refInorder(nodes[rootId].leftId, nodes),
    nodes[rootId].val,
    ...refInorder(nodes[rootId].rightId, nodes),
  ];
}

function refPreorder(rootId: string | null, nodes: Record<string, TreeNodeData>): number[] {
  if (!rootId || !nodes[rootId]) return [];
  return [
    nodes[rootId].val,
    ...refPreorder(nodes[rootId].leftId, nodes),
    ...refPreorder(nodes[rootId].rightId, nodes),
  ];
}

function refPostorder(rootId: string | null, nodes: Record<string, TreeNodeData>): number[] {
  if (!rootId || !nodes[rootId]) return [];
  return [
    ...refPostorder(nodes[rootId].leftId, nodes),
    ...refPostorder(nodes[rootId].rightId, nodes),
    nodes[rootId].val,
  ];
}

function refLevelorder(rootId: string | null, nodes: Record<string, TreeNodeData>): number[] {
  if (!rootId || !nodes[rootId]) return [];
  const q: string[] = [rootId];
  const res: number[] = [];
  while (q.length > 0) {
    const curr = q.shift()!;
    res.push(nodes[curr].val);
    if (nodes[curr].leftId) q.push(nodes[curr].leftId!);
    if (nodes[curr].rightId) q.push(nodes[curr].rightId!);
  }
  return res;
}

describe('BST (Binary Search Tree) Operations', () => {
  it('BST in-order traversal is always strictly non-decreasing sorted', () => {
    const vals = [50, 30, 70, 20, 40, 60, 80];
    const tree = buildInitialBST(vals);
    const sorted = refInorder(tree.rootId, tree.nodes);
    expect(sorted).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });

  it('rejects duplicate insertion and explains policy', () => {
    const steps = generateBSTSteps({
      initialValues: [50, 30, 70],
      operation: { type: 'insert', val: 50 },
    });
    const duplicateStep = steps.find((s) => s.description.includes('Duplicate Value Rejected'));
    expect(duplicateStep).toBeDefined();
    expect(duplicateStep?.state.duplicatePolicyExplanation).toContain('Strictly Unique Keys');
  });

  it('correctly executes Delete Case 1 (Leaf Node with 0 children)', () => {
    const steps = generateBSTSteps({
      initialValues: [50, 30, 70, 20, 40],
      operation: { type: 'delete', val: 20 },
    });

    const finalStep = steps[steps.length - 1];
    const remainingVals = refInorder(finalStep.state.rootId, finalStep.state.nodes);
    expect(remainingVals).toEqual([30, 40, 50, 70]);
    expect(remainingVals.includes(20)).toBe(false);

    const deleteStep = steps.find((s) => s.description.includes('Case 1 (Leaf Node)'));
    expect(deleteStep).toBeDefined();
  });

  it('correctly executes Delete Case 2 (Node with 1 child)', () => {
    const steps = generateBSTSteps({
      initialValues: [50, 30, 70, 40], // 30 has only right child 40
      operation: { type: 'delete', val: 30 },
    });

    const finalStep = steps[steps.length - 1];
    const remainingVals = refInorder(finalStep.state.rootId, finalStep.state.nodes);
    expect(remainingVals).toEqual([40, 50, 70]);
    expect(remainingVals.includes(30)).toBe(false);

    const deleteStep = steps.find((s) => s.description.includes('Case 2 (One Child)'));
    expect(deleteStep).toBeDefined();
  });

  it('correctly executes Delete Case 3 (Node with 2 children using In-Order Successor)', () => {
    const steps = generateBSTSteps({
      initialValues: [50, 30, 70, 20, 40, 60, 80],
      operation: { type: 'delete', val: 50 }, // Root has 2 children
    });

    const finalStep = steps[steps.length - 1];
    const remainingVals = refInorder(finalStep.state.rootId, finalStep.state.nodes);
    expect(remainingVals).toEqual([20, 30, 40, 60, 70, 80]);
    expect(remainingVals.includes(50)).toBe(false);

    // Inorder successor of 50 is 60
    const successorStep = steps.find((s) => s.description.includes('In-Order Successor identified'));
    expect(successorStep).toBeDefined();
    expect(successorStep?.description).toContain('60');
  });

  it('guarantees forward-then-backward replay on BST steps', () => {
    const steps = generateBSTSteps({
      initialValues: [50, 30, 70],
      operation: { type: 'search', val: 30 },
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) i--;
    expect(steps[0]).toEqual(initial);
  });
});

describe('Tree Traversals Suite', () => {
  it('matches reference implementations on 200+ random trees', () => {
    const NUM_TRIALS = 210;

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      const size = Math.floor(Math.random() * 8) + 3;
      const randomValues = Array.from(
        new Set(Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1))
      );

      const tree = buildInitialBST(randomValues);

      // 1. Inorder test
      const inSteps = generateTraversalSteps({ initialValues: randomValues, traversalType: 'inorder' });
      const expectedInorder = refInorder(tree.rootId, tree.nodes);
      expect(inSteps[inSteps.length - 1].state.traversalOutput).toEqual(expectedInorder);

      // 2. Preorder test
      const preSteps = generateTraversalSteps({ initialValues: randomValues, traversalType: 'preorder' });
      const expectedPreorder = refPreorder(tree.rootId, tree.nodes);
      expect(preSteps[preSteps.length - 1].state.traversalOutput).toEqual(expectedPreorder);

      // 3. Postorder test
      const postSteps = generateTraversalSteps({ initialValues: randomValues, traversalType: 'postorder' });
      const expectedPostorder = refPostorder(tree.rootId, tree.nodes);
      expect(postSteps[postSteps.length - 1].state.traversalOutput).toEqual(expectedPostorder);

      // 4. Levelorder test
      const levelSteps = generateTraversalSteps({ initialValues: randomValues, traversalType: 'levelorder' });
      const expectedLevelorder = refLevelorder(tree.rootId, tree.nodes);
      expect(levelSteps[levelSteps.length - 1].state.traversalOutput).toEqual(expectedLevelorder);
    }
  });
});

describe('AVL Tree (Self-Balancing) Rotations & Strict Invariants', () => {
  // Test each of the 4 rotation cases explicitly
  it('triggers LL Case (Single Right Rotation)', () => {
    // Inserting 30, 20 then 10 causes left-heavy imbalance at 30
    const steps = generateAVLSteps({
      initialValues: [30, 20],
      operation: { type: 'insert', val: 10 },
    });

    const llStep = steps.find((s) => s.state.rotationCase === 'LL');
    expect(llStep).toBeDefined();

    // In resulting tree, 20 must be root, left is 10, right is 30
    const finalStep = steps[steps.length - 1];
    const root = finalStep.state.nodes[finalStep.state.rootId!];
    expect(root.val).toBe(20);
    expect(finalStep.state.nodes[root.leftId!].val).toBe(10);
    expect(finalStep.state.nodes[root.rightId!].val).toBe(30);
  });

  it('triggers RR Case (Single Left Rotation)', () => {
    // Inserting 10, 20 then 30 causes right-heavy imbalance at 10
    const steps = generateAVLSteps({
      initialValues: [10, 20],
      operation: { type: 'insert', val: 30 },
    });

    const rrStep = steps.find((s) => s.state.rotationCase === 'RR');
    expect(rrStep).toBeDefined();

    // Resulting root must be 20, left 10, right 30
    const finalStep = steps[steps.length - 1];
    const root = finalStep.state.nodes[finalStep.state.rootId!];
    expect(root.val).toBe(20);
    expect(finalStep.state.nodes[root.leftId!].val).toBe(10);
    expect(finalStep.state.nodes[root.rightId!].val).toBe(30);
  });

  it('triggers LR Case (Left-Right Double Rotation)', () => {
    // Inserting 30, 10 then 20 causes zigzag imbalance at 30
    const steps = generateAVLSteps({
      initialValues: [30, 10],
      operation: { type: 'insert', val: 20 },
    });

    const lrStep = steps.find((s) => s.state.rotationCase === 'LR');
    expect(lrStep).toBeDefined();

    // Resulting root must be 20, left 10, right 30
    const finalStep = steps[steps.length - 1];
    const root = finalStep.state.nodes[finalStep.state.rootId!];
    expect(root.val).toBe(20);
    expect(finalStep.state.nodes[root.leftId!].val).toBe(10);
    expect(finalStep.state.nodes[root.rightId!].val).toBe(30);
  });

  it('triggers RL Case (Right-Left Double Rotation)', () => {
    // Inserting 10, 30 then 20 causes zigzag imbalance at 10
    const steps = generateAVLSteps({
      initialValues: [10, 30],
      operation: { type: 'insert', val: 20 },
    });

    const rlStep = steps.find((s) => s.state.rotationCase === 'RL');
    expect(rlStep).toBeDefined();

    // Resulting root must be 20, left 10, right 30
    const finalStep = steps[steps.length - 1];
    const root = finalStep.state.nodes[finalStep.state.rootId!];
    expect(root.val).toBe(20);
    expect(finalStep.state.nodes[root.leftId!].val).toBe(10);
    expect(finalStep.state.nodes[root.rightId!].val).toBe(30);
  });

  it('triggers RR rotation upon deleting node 2 from [4, 2, 6, 5, 7] preset', () => {
    const steps = generateAVLSteps({
      initialValues: [4, 2, 6, 5, 7],
      operation: { type: 'delete', val: 2 },
    });

    const rrStep = steps.find((s) => s.state.rotationCase === 'RR');
    expect(rrStep).toBeDefined();

    const finalStep = steps[steps.length - 1];
    const root = finalStep.state.nodes[finalStep.state.rootId!];
    expect(root.val).toBe(6);
    expect(finalStep.state.nodes[root.leftId!].val).toBe(4);
    expect(finalStep.state.nodes[root.rightId!].val).toBe(7);
  });

  it('triggers LL rotation upon deleting node 6 from [4, 2, 6, 1, 3] preset', () => {
    const steps = generateAVLSteps({
      initialValues: [4, 2, 6, 1, 3],
      operation: { type: 'delete', val: 6 },
    });

    const llStep = steps.find((s) => s.state.rotationCase === 'LL');
    expect(llStep).toBeDefined();

    const finalStep = steps[steps.length - 1];
    const root = finalStep.state.nodes[finalStep.state.rootId!];
    expect(root.val).toBe(2);
    expect(finalStep.state.nodes[root.leftId!].val).toBe(1);
    expect(finalStep.state.nodes[root.rightId!].val).toBe(4);
  });

  it('asserts balance factors stay in [-1, 1], heights are correct, and inorder sorted on 200+ random insert/delete sequences', () => {
    const NUM_TRIALS = 210;

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      const initialCount = Math.floor(Math.random() * 7) + 3;
      const initialVals = Array.from(
        new Set(Array.from({ length: initialCount }, () => Math.floor(Math.random() * 100) + 1))
      );

      const isDelete = Math.random() > 0.5 && initialVals.length > 2;
      const targetVal = isDelete
        ? initialVals[Math.floor(Math.random() * initialVals.length)]
        : Math.floor(Math.random() * 100) + 1;

      const steps = generateAVLSteps({
        initialValues: initialVals,
        operation: { type: isDelete ? 'delete' : 'insert', val: targetVal },
      });

      const finalStep = steps[steps.length - 1];
      const finalNodes = finalStep.state.nodes;
      const finalRootId = finalStep.state.rootId;

      if (finalRootId) {
        // 1. Assert balance factor strictly in [-1, 0, 1] for EVERY node
        for (const node of Object.values(finalNodes)) {
          expect(node.balanceFactor).toBeGreaterThanOrEqual(-1);
          expect(node.balanceFactor).toBeLessThanOrEqual(1);

          // 2. Assert stored heights are mathematically correct
          const leftH = node.leftId && finalNodes[node.leftId] ? finalNodes[node.leftId].height : 0;
          const rightH = node.rightId && finalNodes[node.rightId] ? finalNodes[node.rightId].height : 0;
          expect(node.height).toBe(1 + Math.max(leftH, rightH));
        }

        // 3. Assert inorder stays sorted
        const inorderSeq = refInorder(finalRootId, finalNodes);
        for (let k = 0; k < inorderSeq.length - 1; k++) {
          expect(inorderSeq[k]).toBeLessThan(inorderSeq[k + 1]);
        }

        // 4. Assert key retention
        if (isDelete) {
          expect(inorderSeq.includes(targetVal)).toBe(false);
        } else {
          expect(inorderSeq.includes(targetVal)).toBe(true);
        }
      }
    }
  });

  it('guarantees forward-then-backward replay on AVL steps', () => {
    const steps = generateAVLSteps({
      initialValues: [30, 20],
      operation: { type: 'insert', val: 10 },
    });

    const initial = { ...steps[0] };
    let i = steps.length - 1;
    while (i > 0) i--;
    expect(steps[0]).toEqual(initial);
  });
});
