import React from 'react';
import type { Step } from '../../types/algorithm';
import type { SortAuxiliary, SortPointer } from '../../types/sorting';
import { HeapTreeVisualizer } from './HeapTreeVisualizer';

interface ArrayVisualizerProps {
  array: number[];
  currentStep: Step<number[], SortAuxiliary> | null;
  sortedIndices?: Set<number>;
  eliminatedRange?: [number, number]; // [start, end] greyed out for binary search
  pointers?: SortPointer[];
  maxVal?: number;
  isSearching?: boolean;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  array,
  currentStep,
  sortedIndices = new Set(),
  eliminatedRange,
  pointers = [],
  maxVal,
  isSearching = false,
}) => {
  const effectiveMax = maxVal || Math.max(...array, 1);

  const highlightedIndices = currentStep?.highlightedIndices || [];
  const secondaryIndices = currentStep?.secondaryIndices || [];
  const aux = currentStep?.auxiliaryState;

  // Extra sorted indices from auxiliary state
  const combinedSorted = new Set<number>(sortedIndices);
  if (aux?.sortedIndices) {
    aux.sortedIndices.forEach((i) => combinedSorted.add(i));
  }

  // Active subarray range (for Merge, Quick, Bubble)
  const activeRange = aux?.activeRange;

  // Merge Sort temp buffer
  const tempArray = aux?.tempArray;
  const tempMergeRange = aux?.tempMergeRange;

  // Heap Sort tree
  const heapTree = aux?.heapTree;
  const heapSize = aux?.heapSize;

  // Combine pointers from props and aux, deduplicated and simplified (show just "Low", "Mid", "High")
  const rawPointers = [...pointers, ...(aux?.pointers || [])];
  const seenPointers = new Set<string>();
  const allPointers: SortPointer[] = [];

  for (const p of rawPointers) {
    // Strip "= X" suffix so label shows only "Low", "Mid", "High"
    const cleanLabel = p.label.split('=')[0].trim();
    const key = `${p.index}-${cleanLabel}`;
    if (!seenPointers.has(key)) {
      seenPointers.add(key);
      allPointers.push({
        ...p,
        label: cleanLabel,
      });
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center p-3 sm:p-4 space-y-3">
      {/* Heap Tree Dual View (when algorithm is Heap Sort) */}
      {heapTree && heapTree.length > 0 && (
        <HeapTreeVisualizer
          heapTree={heapTree}
          heapSize={heapSize}
          highlightedIndices={highlightedIndices}
          secondaryIndices={secondaryIndices}
        />
      )}

      {/* Main Array Bars Container - Centered */}
      <div className="w-full flex flex-col justify-center items-center">
        {/* Active Range & Subarray Indicator */}
        {activeRange && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2 px-2 w-full max-w-xl">
            <span>
              Subarray: [{activeRange[0]}..{activeRange[1]}]
            </span>
            {aux?.partitionScheme && (
              <span className="text-rose-400 font-semibold">{aux.partitionScheme}</span>
            )}
          </div>
        )}

        <div className="flex items-end justify-center gap-1.5 sm:gap-2.5 h-44 sm:h-52 w-full px-2">
          {array.map((val, idx) => {
            const isComparing =
              currentStep?.type === 'compare' && highlightedIndices.includes(idx);
            const isSwapping =
              (currentStep?.type === 'swap' || currentStep?.type === 'assign') &&
              highlightedIndices.includes(idx);
            const isFound =
              (currentStep?.type === 'found' || (isSearching && currentStep?.type === 'complete')) &&
              highlightedIndices.includes(idx);
            const isSecondary = secondaryIndices.includes(idx);
            const isPivot = aux?.pivotIndex === idx;
            const isSorted = !isSearching && (combinedSorted.has(idx) || currentStep?.type === 'complete');

            const isOutsideActive =
              activeRange && (idx < activeRange[0] || idx > activeRange[1]);

            const isEliminated =
              eliminatedRange &&
              idx >= eliminatedRange[0] &&
              idx <= eliminatedRange[1];

            // Compute bar height percentage (min 15% for visibility)
            const heightPercent = Math.max(15, Math.round((val / effectiveMax) * 100));

            // Determine styling
            let barBg = 'bg-slate-700 hover:bg-slate-600';
            let borderCol = 'border-slate-600';
            let shapeIcon: string | null = null;

            if (isEliminated) {
              barBg = 'bg-slate-800/40 opacity-30';
              borderCol = 'border-slate-800';
              shapeIcon = '✕';
            } else if (isPivot) {
              barBg = 'bg-rose-500 shadow-glow';
              borderCol = 'border-rose-300';
              shapeIcon = '▲';
            } else if (isFound) {
              barBg = 'bg-emerald-500 shadow-glow';
              borderCol = 'border-emerald-300';
              shapeIcon = '★';
            } else if (isSwapping) {
              barBg = 'bg-brand-500 shadow-glow animate-bounce-subtle';
              borderCol = 'border-brand-300';
              shapeIcon = '●';
            } else if (isComparing) {
              barBg = 'bg-amber-500 shadow-glow';
              borderCol = 'border-amber-300';
              shapeIcon = '■';
            } else if (isSecondary) {
              barBg = 'bg-cyan-600';
              borderCol = 'border-cyan-400';
            } else if (isSorted) {
              barBg = 'bg-emerald-500/80';
              borderCol = 'border-emerald-500';
              shapeIcon = '✓';
            } else if (isOutsideActive) {
              barBg = 'bg-slate-800 opacity-50';
              borderCol = 'border-slate-700';
            }

            // Active pointers pointing to this index (deduplicated)
            const activePointers = allPointers.filter((p) => p.index === idx);

            return (
              <div
                key={idx}
                className="flex-1 max-w-[44px] flex flex-col items-center justify-end h-full group relative transition-all duration-300"
              >
                {/* Pointer labels on top - rendered once per pointer */}
                {activePointers.length > 0 && (
                  <div className="absolute -top-6 flex flex-col items-center z-10 pointer-events-none">
                    <div className="flex gap-1">
                      {activePointers.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className={`text-[9px] font-bold px-1 py-0.5 rounded text-white ${p.color} shadow-sm whitespace-nowrap`}
                        >
                          {p.label}
                        </span>
                      ))}
                    </div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rotate-45 -mt-0.5" />
                  </div>
                )}

                {/* Value indicator on top of bar */}
                <span className="text-[11px] font-mono font-bold text-slate-300 mb-1 group-hover:text-white transition-colors">
                  {val}
                </span>

                {/* Bar Element */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-lg border-t-2 border-x transition-all duration-300 flex flex-col items-center justify-between py-1.5 ${barBg} ${borderCol}`}
                >
                  {shapeIcon && (
                    <span className="text-[9px] font-bold text-slate-950 bg-white/80 rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none select-none">
                      {shapeIcon}
                    </span>
                  )}
                </div>

                {/* Index indicator */}
                <span className="text-[10px] font-mono text-slate-400 mt-1 select-none">
                  [{idx}]
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Merge Sort Temporary Array View */}
      {tempArray && tempArray.length > 0 && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 max-w-xl w-full">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
            <span>Merge Sort Buffer</span>
            {tempMergeRange && (
              <span className="text-[10px] font-mono text-brand-300">
                Range [{tempMergeRange[0]}..{tempMergeRange[1]}]
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {tempArray.map((val, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  val !== null
                    ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                <span className="text-xs font-mono">{val !== null ? val : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
