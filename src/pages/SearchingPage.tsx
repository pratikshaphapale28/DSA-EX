import React, { useState, useEffect } from 'react';
import { linearSearchAlgorithm } from '../algorithms/searching/linearSearch';
import { binarySearchAlgorithm, type BinarySearchInput } from '../algorithms/searching/binarySearch';
import { ArrayVisualizer } from '../components/visualizers/ArrayVisualizer';
import { InsightPanel } from '../components/insights/InsightPanel';
import { ColorLegend, type LegendItem } from '../components/common/ColorLegend';
import { usePlayerStore } from '../engine/usePlayerStore';
import type { AlgorithmDefinition } from '../types/algorithm';
import {
  Shuffle,
  AlertTriangle,
  ArrowDownAZ,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const searchingLegendItems: LegendItem[] = [
  { color: 'bg-brand-500', shape: 'square', label: 'Active' },
  { color: 'bg-cyan-600', customSymbol: 'PTR', label: 'Pointers' },
  { color: 'bg-amber-500', customSymbol: 'MID', label: 'Mid' },
  { color: 'bg-slate-800', shape: 'dash', label: 'Eliminated' },
  { color: 'bg-emerald-500', shape: 'check', label: 'Found' },
];

export const SearchingPage: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<'linear' | 'binary'>('binary');
  const [inputArray, setInputArray] = useState<number[]>([8, 14, 22, 31, 38, 49, 65, 73]);
  const [target, setTarget] = useState<number>(49);
  const [customArrayText, setCustomArrayText] = useState<string>('8, 14, 22, 31, 38, 49, 65, 73');

  const { mode, setSteps, getCurrentStep } = usePlayerStore();
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(mode === 'beginner');

  const currentStep = getCurrentStep();

  const isBinary = selectedAlgoId === 'binary';
  const currentAlgorithm: AlgorithmDefinition<any, any, any> = isBinary
    ? binarySearchAlgorithm
    : linearSearchAlgorithm;

  // Keep isAboutExpanded synced when mode toggles
  useEffect(() => {
    setIsAboutExpanded(mode === 'beginner');
  }, [mode]);

  // Check if current array is sorted
  const isSorted = inputArray.every((val, i, arr) => i === 0 || arr[i - 1] <= val);

  // Generate steps
  useEffect(() => {
    if (isBinary) {
      const steps = binarySearchAlgorithm.generateSteps({
        array: inputArray,
        target,
      });
      setSteps(steps);
    } else {
      const steps = linearSearchAlgorithm.generateSteps({
        array: inputArray,
        target,
      });
      setSteps(steps);
    }
  }, [selectedAlgoId, inputArray, target, setSteps, isBinary]);

  // Handle preset selection
  const handlePreset = (presetInput: BinarySearchInput) => {
    setInputArray(presetInput.array);
    setTarget(presetInput.target);
    setCustomArrayText(presetInput.array.join(', '));
  };

  // Sort array immediately
  const handleSortFirst = () => {
    const sorted = [...inputArray].sort((a, b) => a - b);
    setInputArray(sorted);
    setCustomArrayText(sorted.join(', '));
  };

  // Generate random array
  const handleRandomize = () => {
    const size = Math.floor(Math.random() * 4) + 6;
    let newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
    if (isBinary) {
      newArr.sort((a, b) => a - b);
    }
    const newTarget =
      Math.random() > 0.3
        ? newArr[Math.floor(Math.random() * newArr.length)]
        : Math.floor(Math.random() * 85) + 10;
    setInputArray(newArr);
    setTarget(newTarget);
    setCustomArrayText(newArr.join(', '));
  };

  // Handle custom array submit
  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customArrayText
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0 && n <= 999);
    if (parsed.length >= 2) {
      setInputArray(parsed);
    }
  };

  // Eliminated range from current step
  const eliminatedRange = currentStep?.auxiliaryState?.eliminatedRange;

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 h-full overflow-hidden">
      {/* Center Visualization Workspace */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 pb-20 space-y-2.5 overflow-y-auto">
        {/* 1. Algorithm Tabs Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedAlgoId('binary')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isBinary
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Binary Search
            </button>
            <button
              onClick={() => setSelectedAlgoId('linear')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !isBinary
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Linear Search
            </button>
          </div>

          {/* Unsorted warning for Binary Search */}
          {isBinary && !isSorted && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Array unsorted</span>
              <button
                onClick={handleSortFirst}
                className="ml-1 px-1.5 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 flex items-center gap-0.5"
              >
                <ArrowDownAZ className="w-3 h-3" />
                Sort First
              </button>
            </div>
          )}
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
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Presets:</span>
            {currentAlgorithm.sampleInputs?.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handlePreset(sample.input as BinarySearchInput)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
              >
                {sample.label.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* Target & Array Input & Randomize */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label htmlFor="target-input" className="text-slate-400 text-[11px] font-medium">
                Target:
              </label>
              <input
                id="target-input"
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-amber-300 font-bold focus:outline-none focus:border-brand-500"
              />
            </div>

            <form onSubmit={handleApplyCustom} className="flex items-center gap-1.5">
              <input
                type="text"
                value={customArrayText}
                onChange={(e) => setCustomArrayText(e.target.value)}
                placeholder="8, 14, 22..."
                className="w-28 sm:w-36 px-2 py-0.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-2 py-0.5 font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
              >
                Apply
              </button>
            </form>

            <button
              onClick={handleRandomize}
              className="flex items-center gap-1 px-2.5 py-0.5 font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded shadow-sm"
              aria-label="Randomize array and target"
            >
              <Shuffle className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>
        </div>

        {/* 4. Canvas Area (Centered content, 300-340px height) */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-3 h-[300px] sm:h-[340px] relative overflow-hidden">
          {(currentStep?.type === 'not-found' ||
            (currentStep?.type === 'complete' &&
              currentStep?.auxiliaryState?.foundIndex === -1)) && (
            <div className="absolute top-3 px-3 py-1 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-bold animate-pulse z-20">
              Target {target} not found in array
            </div>
          )}
          <ArrayVisualizer
            array={inputArray}
            currentStep={currentStep}
            eliminatedRange={eliminatedRange}
            isSearching={true}
          />
        </div>

        {/* 5. Legend directly under the canvas as one short row */}
        <ColorLegend items={searchingLegendItems} />
      </div>

      {/* Right Live Insight Panel */}
      <InsightPanel
        algorithm={currentAlgorithm}
        inputSize={inputArray.length}
      />
    </div>
  );
};
