import React, { useState, useEffect } from 'react';
import { bstAlgorithm, type BSTOperationInput } from '../algorithms/trees/bst';
import { traversalsAlgorithm, type TraversalInput } from '../algorithms/trees/traversals';
import { avlAlgorithm, type AVLInput } from '../algorithms/trees/avl';
import { TreeVisualizer } from '../components/visualizers/TreeVisualizer';
import { InsightPanel } from '../components/insights/InsightPanel';
import { ColorLegend, type LegendItem } from '../components/common/ColorLegend';
import { usePlayerStore } from '../engine/usePlayerStore';
import type { TreeSnapshot } from '../types/tree';
import type { AlgorithmDefinition } from '../types/algorithm';
import {
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const treeLegendItems: LegendItem[] = [
  { color: 'bg-slate-700', shape: 'circle', label: 'Node' },
  { color: 'bg-brand-500', shape: 'circle', label: 'Active' },
  { color: 'bg-violet-600', shape: 'circle', label: 'Successor' },
  { color: 'bg-cyan-600', customSymbol: 'h:X', label: 'Height' },
  { color: 'bg-emerald-600', customSymbol: 'BF', label: 'Balanced' },
  { color: 'bg-rose-600', customSymbol: '!BF', label: 'Unbalanced' },
];

export const TreesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bst' | 'traversals' | 'avl'>('bst');
  const [initialTreeVals, setInitialTreeVals] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  const [targetVal, setTargetVal] = useState<number>(40);
  const [operationType, setOperationType] = useState<'search' | 'insert' | 'delete'>('search');
  const [traversalType, setTraversalType] = useState<'inorder' | 'preorder' | 'postorder' | 'levelorder'>('inorder');

  const { mode, setSteps, getCurrentStep } = usePlayerStore();
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(false);

  const currentStep = getCurrentStep();

  let currentAlgorithm: AlgorithmDefinition<any, TreeSnapshot, any>;
  switch (activeTab) {
    case 'traversals':
      currentAlgorithm = traversalsAlgorithm;
      break;
    case 'avl':
      currentAlgorithm = avlAlgorithm;
      break;
    case 'bst':
    default:
      currentAlgorithm = bstAlgorithm;
      break;
  }

  // Re-generate steps on state change
  useEffect(() => {
    if (activeTab === 'bst') {
      const steps = bstAlgorithm.generateSteps({
        initialValues: initialTreeVals,
        operation: { type: operationType, val: targetVal },
      });
      setSteps(steps);
    } else if (activeTab === 'traversals') {
      const steps = traversalsAlgorithm.generateSteps({
        initialValues: initialTreeVals,
        traversalType,
      });
      setSteps(steps);
    } else if (activeTab === 'avl') {
      const steps = avlAlgorithm.generateSteps({
        initialValues: initialTreeVals,
        operation: {
          type: operationType === 'delete' ? 'delete' : 'insert',
          val: targetVal,
        },
      });
      setSteps(steps);
    }
  }, [activeTab, initialTreeVals, targetVal, operationType, traversalType, setSteps]);

  // Tab change handler
  const handleTabChange = (tab: 'bst' | 'traversals' | 'avl') => {
    setActiveTab(tab);
    if (tab === 'avl') {
      setInitialTreeVals([30, 20, 40, 10, 25]);
      setTargetVal(5);
      setOperationType('insert');
    } else if (tab === 'traversals') {
      setInitialTreeVals([50, 30, 70, 20, 40, 60, 80]);
      setTraversalType('inorder');
    } else {
      setInitialTreeVals([50, 30, 70, 20, 40, 60, 80]);
      setTargetVal(40);
      setOperationType('search');
    }
  };

  // Preset handlers
  const handlePreset = (sampleInput: any) => {
    if (activeTab === 'bst') {
      const input = sampleInput as BSTOperationInput;
      setInitialTreeVals(input.initialValues);
      setTargetVal(input.operation.val);
      setOperationType(input.operation.type);
    } else if (activeTab === 'traversals') {
      const input = sampleInput as TraversalInput;
      setInitialTreeVals(input.initialValues);
      setTraversalType(input.traversalType);
    } else if (activeTab === 'avl') {
      const input = sampleInput as AVLInput;
      setInitialTreeVals(input.initialValues);
      setTargetVal(input.operation.val);
      setOperationType(input.operation.type);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 h-full overflow-hidden">
      {/* Center Visualization Canvas */}
      <div className="flex-1 flex flex-col p-2.5 sm:p-3 min-w-0 min-h-0 h-full overflow-hidden gap-1.5">
        {/* 1. Algorithm Tabs Row */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/60 px-2 py-1 rounded-xl border border-slate-800 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleTabChange('bst')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bst' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Binary Search Tree
            </button>
            <button
              onClick={() => handleTabChange('traversals')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'traversals' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Traversals
            </button>
            <button
              onClick={() => handleTabChange('avl')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'avl' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              AVL Tree
            </button>
          </div>
        </div>

        {/* 2. "About this algorithm" collapsible line (Starts collapsed, expands as popover overlay) */}
        <div className="relative shrink-0">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <button
              onClick={() => setIsAboutExpanded(!isAboutExpanded)}
              className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-white transition-colors text-left"
              aria-expanded={isAboutExpanded}
            >
              <span className="flex items-center gap-1.5">
                <span>About {currentAlgorithm.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isAboutExpanded ? 'Click to close popover' : 'Click to read overview'})
                </span>
              </span>
              {isAboutExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              )}
            </button>
          </div>

          {isAboutExpanded && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs text-slate-300 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
                <span className="font-bold text-white">{currentAlgorithm.name}</span>
                <button
                  onClick={() => setIsAboutExpanded(false)}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  ✕ Close
                </button>
              </div>
              <p>{currentAlgorithm.description}</p>
              {currentAlgorithm.realWorldAnalogy && (
                <p className="text-brand-300">
                  <strong className="text-brand-400">Real-World Analogy: </strong>
                  {currentAlgorithm.realWorldAnalogy}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3. Single Compact Preset & Input Row */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800 text-xs shrink-0">
          {/* Presets */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Presets:</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {currentAlgorithm.sampleInputs?.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePreset(sample.input)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shrink-0 text-xs"
                >
                  {sample.label.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Value & Actions in same row */}
          {activeTab !== 'traversals' ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <label htmlFor="tree-val" className="text-slate-400 text-[11px]">
                Val:
              </label>
              <input
                id="tree-val"
                type="number"
                value={targetVal}
                onChange={(e) => setTargetVal(Number(e.target.value))}
                className="w-12 px-1.5 py-0.5 text-xs font-mono font-bold bg-slate-800 border border-slate-700 rounded text-slate-100 text-center"
              />

              {activeTab === 'bst' && (
                <button
                  onClick={() => setOperationType('search')}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                    operationType === 'search'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>Search</span>
                </button>
              )}

              <button
                onClick={() => setOperationType('insert')}
                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                  operationType === 'insert'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Insert</span>
              </button>

              <button
                onClick={() => setOperationType('delete')}
                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                  operationType === 'delete'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          ) : (
            /* Traversals selector in same row */
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-400 text-[11px]">Order:</span>
              {(['inorder', 'preorder', 'postorder', 'levelorder'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTraversalType(t)}
                  className={`px-2 py-0.5 rounded capitalize text-xs ${
                    traversalType === t ? 'bg-brand-600 text-white font-semibold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Tree Canvas (flex-1 with min-height: 45vh and floating overlay legend) */}
        <TreeVisualizer
          snapshot={currentStep?.state || null}
          legendItems={treeLegendItems}
        />
      </div>

      {/* Right Live Insight Panel */}
      <InsightPanel
        algorithm={currentAlgorithm}
        inputSize={initialTreeVals.length}
      />
    </div>
  );
};
