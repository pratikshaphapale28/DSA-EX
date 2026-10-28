import React, { useState, useEffect } from 'react';
import { bubbleSortAlgorithm } from '../algorithms/sorting/bubbleSort';
import { selectionSortAlgorithm } from '../algorithms/sorting/selectionSort';
import { insertionSortAlgorithm } from '../algorithms/sorting/insertionSort';
import { mergeSortAlgorithm } from '../algorithms/sorting/mergeSort';
import { quickSortAlgorithm } from '../algorithms/sorting/quickSort';
import { heapSortAlgorithm } from '../algorithms/sorting/heapSort';
import { ArrayVisualizer } from '../components/visualizers/ArrayVisualizer';
import { InsightPanel } from '../components/insights/InsightPanel';
import { ColorLegend, type LegendItem } from '../components/common/ColorLegend';
import { usePlayerStore } from '../engine/usePlayerStore';
import type { AlgorithmDefinition } from '../types/algorithm';
import type { SortAuxiliary } from '../types/sorting';
import {
  Shuffle,
  Columns2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const sortingAlgorithms: AlgorithmDefinition<number[], number[], SortAuxiliary>[] = [
  bubbleSortAlgorithm,
  selectionSortAlgorithm,
  insertionSortAlgorithm,
  mergeSortAlgorithm,
  quickSortAlgorithm,
  heapSortAlgorithm,
];

const sortingLegendItems: LegendItem[] = [
  { color: 'bg-slate-700', shape: 'square', label: 'Unsorted' },
  { color: 'bg-amber-500', shape: 'square', label: 'Comparing' },
  { color: 'bg-brand-500', shape: 'circle', label: 'Swapping' },
  { color: 'bg-rose-500', shape: 'triangle', label: 'Pivot' },
  { color: 'bg-emerald-500', shape: 'check', label: 'Sorted' },
];

export const SortingPage: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('bubble-sort');
  const [inputArray, setInputArray] = useState<number[]>([35, 12, 48, 20, 9, 64, 27]);
  const [customInputText, setCustomInputText] = useState<string>('35, 12, 48, 20, 9, 64, 27');
  const [arraySize, setArraySize] = useState<number>(7);

  // Side-by-side comparison state
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareAlgoIdB, setCompareAlgoIdB] = useState<string>('quick-sort');

  const { mode, setSteps, getCurrentStep } = usePlayerStore();
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(mode === 'beginner');

  const currentStep = getCurrentStep();

  const currentAlgorithm =
    sortingAlgorithms.find((a) => a.id === selectedAlgoId) || sortingAlgorithms[0];
  const compareAlgorithmB =
    sortingAlgorithms.find((a) => a.id === compareAlgoIdB) || sortingAlgorithms[4];

  // Keep isAboutExpanded synced when mode toggles
  useEffect(() => {
    setIsAboutExpanded(mode === 'beginner');
  }, [mode]);

  // Re-generate steps whenever algorithm or input array changes
  useEffect(() => {
    const steps = currentAlgorithm.generateSteps(inputArray);
    setSteps(steps);
  }, [selectedAlgoId, inputArray, currentAlgorithm, setSteps]);

  // Input presets
  const handlePreset = (type: 'random' | 'nearly-sorted' | 'reversed' | 'few-unique') => {
    let newArr: number[] = [];
    const size = arraySize;

    if (type === 'random') {
      newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
    } else if (type === 'nearly-sorted') {
      newArr = Array.from({ length: size }, (_, i) => (i + 1) * 10);
      if (size > 2) {
        const idx1 = Math.floor(Math.random() * (size - 1));
        const temp = newArr[idx1];
        newArr[idx1] = newArr[idx1 + 1];
        newArr[idx1 + 1] = temp;
      }
    } else if (type === 'reversed') {
      newArr = Array.from({ length: size }, (_, i) => (size - i) * 12);
    } else if (type === 'few-unique') {
      const candidates = [15, 40, 75];
      newArr = Array.from({ length: size }, () => candidates[Math.floor(Math.random() * candidates.length)]);
    }

    setInputArray(newArr);
    setCustomInputText(newArr.join(', '));
  };

  const handleSizeChange = (newSize: number) => {
    setArraySize(newSize);
    const newArr = Array.from({ length: newSize }, () => Math.floor(Math.random() * 85) + 10);
    setInputArray(newArr);
    setCustomInputText(newArr.join(', '));
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customInputText
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0 && n <= 999);
    if (parsed.length >= 2) {
      setInputArray(parsed);
      setArraySize(parsed.length);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 h-full overflow-hidden">
      {/* Center Visualization Workspace */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 pb-20 space-y-2.5 overflow-y-auto">
        {/* 1. Algorithm Tabs Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {sortingAlgorithms.map((algo) => {
              const isSelected = selectedAlgoId === algo.id;
              return (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgoId(algo.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {algo.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isCompareMode
                  ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              aria-label="Toggle comparison mode"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>{isCompareMode ? 'Single View' : 'Compare'}</span>
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
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Presets:</span>
            <button
              onClick={() => handlePreset('random')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Random
            </button>
            <button
              onClick={() => handlePreset('nearly-sorted')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Nearly Sorted
            </button>
            <button
              onClick={() => handlePreset('reversed')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Reversed
            </button>
            <button
              onClick={() => handlePreset('few-unique')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Few Unique
            </button>

            {/* Size Slider */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-slate-400 text-[11px]">Size: {arraySize}</span>
              <input
                type="range"
                min={4}
                max={20}
                value={arraySize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>

          {/* Array Input & Randomize */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleApplyCustom} className="flex items-center gap-1.5">
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="25, 10, 45..."
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
              onClick={() => handlePreset('random')}
              className="flex items-center gap-1 px-2.5 py-0.5 font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded shadow-sm"
              aria-label="Randomize array"
            >
              <Shuffle className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>
        </div>

        {/* 4. Canvas Area (Centered content, 300-360px height) */}
        {!isCompareMode ? (
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-center p-3 h-[300px] sm:h-[340px] relative overflow-hidden">
            <ArrayVisualizer
              array={currentStep?.state || inputArray}
              currentStep={currentStep}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[300px] sm:h-[340px]">
            {/* Algorithm A */}
            <div className="bg-slate-900/40 rounded-2xl border border-brand-500/30 p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                <span className="font-bold text-brand-300">A: {currentAlgorithm.name}</span>
                <span className="font-mono text-slate-400">{currentAlgorithm.complexity.average}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <ArrayVisualizer
                  array={currentStep?.state || inputArray}
                  currentStep={currentStep}
                />
              </div>
            </div>

            {/* Algorithm B */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                <select
                  value={compareAlgoIdB}
                  onChange={(e) => setCompareAlgoIdB(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200"
                >
                  {sortingAlgorithms.map((algo) => (
                    <option key={algo.id} value={algo.id}>
                      B: {algo.name}
                    </option>
                  ))}
                </select>
                <span className="font-mono text-slate-400">{compareAlgorithmB.complexity.average}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <ArrayVisualizer
                  array={currentStep?.state || inputArray}
                  currentStep={currentStep}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. Legend directly under the canvas as one short row */}
        <ColorLegend items={sortingLegendItems} />
      </div>

      {/* Right Live Insight Panel */}
      <InsightPanel
        algorithm={currentAlgorithm}
        inputSize={inputArray.length}
      />
    </div>
  );
};
