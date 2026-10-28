import React, { useState, useEffect } from 'react';
import { stackAlgorithm, type StackInput } from '../algorithms/stackQueue/stackOps';
import { queueAlgorithm, type QueueInput } from '../algorithms/stackQueue/queueOps';
import { circularQueueAlgorithm, type CircularQueueInput } from '../algorithms/stackQueue/circularQueue';
import { balancedParenthesesAlgorithm, type ParenthesesInput } from '../algorithms/stackQueue/balancedParentheses';
import { StackQueueVisualizer } from '../components/visualizers/StackQueueVisualizer';
import { InsightPanel } from '../components/insights/InsightPanel';
import { ColorLegend, type LegendItem } from '../components/common/ColorLegend';
import { usePlayerStore } from '../engine/usePlayerStore';
import type { StackQueueSnapshot } from '../types/stack-queue';
import type { AlgorithmDefinition } from '../types/algorithm';
import {
  Plus,
  Minus,
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const stackQueueLegendItems: LegendItem[] = [
  { color: 'bg-brand-500', shape: 'square', label: 'Active' },
  { color: 'bg-cyan-500', customSymbol: 'TOP', label: 'Top / Front' },
  { color: 'bg-amber-500', customSymbol: 'REAR', label: 'Rear' },
  { color: 'bg-slate-800', shape: 'dash', label: 'Empty' },
  { color: 'bg-rose-500', customSymbol: '!', label: 'Overflow / Underflow' },
];

export const StackQueuePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stack' | 'queue' | 'circular-queue' | 'parentheses'>('stack');
  const [capacity, setCapacity] = useState<number>(5);
  const [pushVal, setPushVal] = useState<number>(42);
  const [parenText, setParenText] = useState<string>('{[()]}');

  const [customOps, setCustomOps] = useState<any[]>(stackAlgorithm.defaultInput.operations);

  const { mode, setSteps, getCurrentStep } = usePlayerStore();
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(mode === 'beginner');

  const currentStep = getCurrentStep();

  // Active algorithm definition
  let currentAlgorithm: AlgorithmDefinition<any, StackQueueSnapshot, any>;
  switch (activeTab) {
    case 'queue':
      currentAlgorithm = queueAlgorithm;
      break;
    case 'circular-queue':
      currentAlgorithm = circularQueueAlgorithm;
      break;
    case 'parentheses':
      currentAlgorithm = balancedParenthesesAlgorithm;
      break;
    case 'stack':
    default:
      currentAlgorithm = stackAlgorithm;
      break;
  }

  // Keep isAboutExpanded synced when mode toggles
  useEffect(() => {
    setIsAboutExpanded(mode === 'beginner');
  }, [mode]);

  // Re-generate steps on tab or parameter changes
  useEffect(() => {
    if (activeTab === 'stack') {
      const steps = stackAlgorithm.generateSteps({
        capacity,
        operations: customOps,
      } as StackInput);
      setSteps(steps);
    } else if (activeTab === 'queue') {
      const steps = queueAlgorithm.generateSteps({
        capacity,
        operations: customOps,
      } as QueueInput);
      setSteps(steps);
    } else if (activeTab === 'circular-queue') {
      const steps = circularQueueAlgorithm.generateSteps({
        capacity,
        operations: customOps,
      } as CircularQueueInput);
      setSteps(steps);
    } else if (activeTab === 'parentheses') {
      const steps = balancedParenthesesAlgorithm.generateSteps({
        text: parenText,
      } as ParenthesesInput);
      setSteps(steps);
    }
  }, [activeTab, capacity, customOps, parenText, setSteps]);

  // Quick tab switcher
  const handleTabChange = (tab: 'stack' | 'queue' | 'circular-queue' | 'parentheses') => {
    setActiveTab(tab);
    if (tab === 'stack') {
      setCustomOps(stackAlgorithm.defaultInput.operations);
      setCapacity(5);
    } else if (tab === 'queue') {
      setCustomOps(queueAlgorithm.defaultInput.operations);
      setCapacity(5);
    } else if (tab === 'circular-queue') {
      setCustomOps(circularQueueAlgorithm.defaultInput.operations);
      setCapacity(6);
    } else {
      setParenText('{[()]}');
    }
  };

  const handleAddPush = () => {
    const nextVal = pushVal || Math.floor(Math.random() * 80) + 10;
    if (activeTab === 'stack') {
      setCustomOps([...customOps, { type: 'push', value: nextVal }]);
    } else {
      setCustomOps([...customOps, { type: 'enqueue', value: nextVal }]);
    }
    setPushVal(Math.floor(Math.random() * 80) + 10);
  };

  const handleAddPop = () => {
    if (activeTab === 'stack') {
      setCustomOps([...customOps, { type: 'pop' }]);
    } else {
      setCustomOps([...customOps, { type: 'dequeue' }]);
    }
  };

  const handleAddPeek = () => {
    if (activeTab === 'stack') {
      setCustomOps([...customOps, { type: 'peek' }]);
    } else {
      setCustomOps([...customOps, { type: 'front' }]);
    }
  };

  const handleClearOps = () => {
    setCustomOps([]);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 h-full overflow-hidden">
      {/* Center Visualization Workspace */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 pb-20 space-y-2.5 overflow-y-auto">
        {/* 1. Algorithm Tabs Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleTabChange('stack')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'stack' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Stack
            </button>
            <button
              onClick={() => handleTabChange('queue')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'queue' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Queue
            </button>
            <button
              onClick={() => handleTabChange('circular-queue')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'circular-queue' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Circular Queue
            </button>
            <button
              onClick={() => handleTabChange('parentheses')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'parentheses' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Parentheses
            </button>
          </div>
        </div>

        {/* 2. "About this algorithm" collapsible line */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <button
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-white transition-colors text-left"
            aria-expanded={isAboutExpanded}
          >
            <span>About {currentAlgorithm.name}</span>
            {isAboutExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            )}
          </button>

          {isAboutExpanded && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
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

        {/* 3. Single Compact Input Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          {activeTab !== 'parentheses' ? (
            <>
              {/* Presets / Scenarios & Capacity */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-medium text-[11px]">Presets:</span>
                {currentAlgorithm.sampleInputs?.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCapacity(sample.input.capacity);
                      setCustomOps(sample.input.operations);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
                  >
                    {sample.label.split('(')[0].trim()}
                  </button>
                ))}

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                  <span className="text-slate-400 text-[11px]">Cap:</span>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                  >
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons in same row */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={pushVal}
                  onChange={(e) => setPushVal(Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-100"
                />
                <button
                  onClick={handleAddPush}
                  className="flex items-center gap-1 px-2 py-0.5 font-bold bg-brand-600 hover:bg-brand-500 text-white rounded shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>{activeTab === 'stack' ? 'Push' : 'Enqueue'}</span>
                </button>
                <button
                  onClick={handleAddPop}
                  className="flex items-center gap-1 px-2 py-0.5 font-bold bg-rose-600/80 hover:bg-rose-500 text-white rounded"
                >
                  <Minus className="w-3 h-3" />
                  <span>{activeTab === 'stack' ? 'Pop' : 'Dequeue'}</span>
                </button>
                {activeTab !== 'circular-queue' && (
                  <button
                    onClick={handleAddPeek}
                    className="flex items-center gap-1 px-2 py-0.5 font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>{activeTab === 'stack' ? 'Peek' : 'Front'}</span>
                  </button>
                )}
                <button
                  onClick={handleClearOps}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
                  title="Clear operations"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </>
          ) : (
            /* Parentheses Demo String Input */
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium text-[11px]">Presets:</span>
                {balancedParenthesesAlgorithm.sampleInputs?.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setParenText((sample.input as ParenthesesInput).text)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
                  >
                    {sample.label.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="paren-input" className="text-[11px] text-slate-400">
                  Expression:
                </label>
                <input
                  id="paren-input"
                  type="text"
                  value={parenText}
                  onChange={(e) => setParenText(e.target.value)}
                  placeholder="e.g. {[()]}"
                  className="w-36 px-2 py-0.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Canvas Area (Centered content, 300-340px height) */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-center p-3 h-[300px] sm:h-[340px] relative overflow-hidden">
          <StackQueueVisualizer snapshot={currentStep?.state || null} />
        </div>

        {/* 5. Legend directly under the canvas as one short row */}
        <ColorLegend items={stackQueueLegendItems} />
      </div>

      {/* Right Live Insight Panel */}
      <InsightPanel
        algorithm={currentAlgorithm}
        inputSize={activeTab === 'parentheses' ? parenText.length : capacity}
      />
    </div>
  );
};
