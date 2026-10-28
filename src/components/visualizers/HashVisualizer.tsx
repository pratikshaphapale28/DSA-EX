import React from 'react';
import type { HashSnapshot } from '../../types/hash';
import {
  Hash,
  AlertTriangle,
  RefreshCw,
  Search,
  XCircle,
  Skull,
  ArrowRight,
} from 'lucide-react';

interface HashVisualizerProps {
  snapshot: HashSnapshot | null;
  onTriggerRehash: () => void;
}

export const HashVisualizer: React.FC<HashVisualizerProps> = ({
  snapshot,
  onTriggerRehash,
}) => {
  if (!snapshot) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-8">
        <Hash className="w-8 h-8 text-slate-600 mb-2" />
        <span>Hash table initialized. Select an operation to visualize execution.</span>
      </div>
    );
  }

  const {
    capacity,
    count,
    tombstoneCount,
    loadFactor,
    collisionStrategy,
    hashFunction,
    table,
    chains,
    activeSlotIndex,
    probeSequence = [],
    firstTombstoneIndex,
    foundSlotIndex,
    isTableFull,
    isProbeFailed,
    isDuplicateRejected,
    resizeRecommended,
    hashComputationExplanation,
  } = snapshot;

  const threshold = collisionStrategy === 'chaining' ? 0.75 : 0.5;
  const isOverThreshold = loadFactor >= threshold;

  // Load factor meter percentage
  const loadPercentage = Math.min(100, Math.round(loadFactor * 100));

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 space-y-4 select-none">
      {/* Top Status & Live Load Factor Meter */}
      <div className="w-full bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Strategy & Function Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/40">
              Strategy: <strong className="capitalize">{collisionStrategy.replace('-', ' ')}</strong>
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
              Function: <strong className="capitalize">{hashFunction.replace('-', ' ')}</strong>
            </span>
            {tombstoneCount > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/40">
                <Skull className="w-3.5 h-3.5 text-amber-400" />
                <span>{tombstoneCount} Tombstone(s)</span>
              </span>
            )}
          </div>

          {/* Quick Rehash Button if Threshold Exceeded */}
          {resizeRecommended && (
            <button
              onClick={onTriggerRehash}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all animate-pulse"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resize Table (2× Capacity)</span>
            </button>
          )}
        </div>

        {/* Live Load Factor Meter */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">
              Load Factor (α = n / m):{' '}
              <strong
                className={
                  loadFactor > 0.75
                    ? 'text-rose-400 font-bold'
                    : isOverThreshold
                    ? 'text-amber-400 font-bold'
                    : 'text-emerald-400 font-bold'
                }
              >
                {count} / {capacity} ({loadFactor})
              </strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              Threshold: {threshold} (
              {isOverThreshold ? (
                <span className="text-rose-400 font-semibold">Exceeded</span>
              ) : (
                <span className="text-emerald-400">Optimal</span>
              )}
              )
            </span>
          </div>

          {/* Meter Bar */}
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                loadFactor > 0.75
                  ? 'bg-rose-500'
                  : isOverThreshold
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
        </div>

        {/* Hash Computation Derivation */}
        {hashComputationExplanation && (
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/20 truncate">
            {hashComputationExplanation}
          </div>
        )}
      </div>

      {/* Special State Alerts */}
      {isDuplicateRejected && (
        <div className="w-full bg-amber-950/50 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-bold">Duplicate Key Blocked: </strong>
            Hash table enforces strictly unique keys (set semantics). Key already exists; insertion was safely rejected without creating duplicates.
          </div>
        </div>
      )}

      {isProbeFailed && (
        <div className="w-full bg-rose-950/60 border border-rose-500/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-200 animate-shake">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 font-bold">Quadratic Probing Cycle Failure: </strong>
            Unable to find a vacant slot within {capacity} probes. Quadratic probing formula (h + i²) can get stuck in a quadratic residue cycle when table capacity is composite or load factor exceeds 0.5. Click <strong>"Resize Table"</strong> to double capacity and break the cycle.
          </div>
        </div>
      )}

      {isTableFull && (
        <div className="w-full bg-rose-950/60 border border-rose-500/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 font-bold">Table Saturated: </strong>
            All slots are occupied or marked as tombstones. Linear probing cannot insert new entries without table resizing.
          </div>
        </div>
      )}

      {/* Main Table Visualization Canvas */}
      <div className="flex-1 w-full bg-slate-950/40 rounded-2xl border border-slate-800 p-4 overflow-y-auto max-h-[380px] flex flex-col justify-center">
        {collisionStrategy === 'chaining' ? (
          /* SEPARATE CHAINING BUCKETS */
          <div className="flex flex-col gap-2.5 w-full">
            {chains?.map((bucket, bucketIdx) => {
              const isActive = activeSlotIndex === bucketIdx;
              const isFound = foundSlotIndex === bucketIdx;

              return (
                <div
                  key={bucketIdx}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                    isFound
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md'
                      : isActive
                      ? 'bg-cyan-950/30 border-cyan-500/50'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  {/* Bucket Header */}
                  <div className="flex items-center gap-1.5 w-20 shrink-0 font-mono text-xs font-bold text-slate-300">
                    <span className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
                      [{bucketIdx}]
                    </span>
                    <span className="text-[11px] text-slate-400">({bucket.length})</span>
                  </div>

                  {/* Bucket Chain Items */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {bucket.length === 0 ? (
                      <span className="text-slate-600 text-xs italic font-mono pl-1">null (empty)</span>
                    ) : (
                      bucket.map((entry, eIdx) => (
                        <React.Fragment key={eIdx}>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 shadow-sm shrink-0">
                            <span className="font-mono text-xs font-bold text-slate-100">
                              {entry.key}
                            </span>
                            <span className="text-slate-400 text-xs">:</span>
                            <span className="font-mono text-xs text-brand-300">
                              {entry.val}
                            </span>
                          </div>
                          {eIdx < bucket.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* OPEN ADDRESSING SLOTS (Linear / Quadratic Probing) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 w-full">
            {table.map((slot, idx) => {
              const isActive = activeSlotIndex === idx;
              const isFound = foundSlotIndex === idx;
              const isFirstTombstone = firstTombstoneIndex === idx;
              const probeRank = probeSequence.indexOf(idx);

              let borderColor = 'border-slate-800';
              let bgColor = 'bg-slate-900/40';

              if (isFound) {
                borderColor = 'border-emerald-500 shadow-emerald-950/50 shadow-lg';
                bgColor = 'bg-emerald-950/40';
              } else if (isActive) {
                borderColor = 'border-cyan-400 shadow-cyan-950/50 shadow-md animate-pulse';
                bgColor = 'bg-cyan-950/40';
              } else if (isFirstTombstone) {
                borderColor = 'border-violet-500';
                bgColor = 'bg-violet-950/30';
              }

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col p-2.5 rounded-xl border ${borderColor} ${bgColor} transition-all duration-200 min-h-[72px] justify-between`}
                >
                  {/* Slot Header Index */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-slate-300">Slot {idx}</span>
                    {probeRank !== -1 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        #{probeRank}
                      </span>
                    )}
                  </div>

                  {/* Slot Value */}
                  <div className="flex items-center justify-center py-1">
                    {slot === null ? (
                      <span className="text-slate-600 text-xs italic font-mono">EMPTY</span>
                    ) : slot.isTombstone ? (
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                        <Skull className="w-3 h-3 text-amber-400" />
                        <span>DEL</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-100 truncate">
                        <span>{slot.key}</span>
                        <span className="text-slate-400 font-normal">:</span>
                        <span className="text-brand-300">{slot.val}</span>
                      </div>
                    )}
                  </div>

                  {/* Tombstone reclaimed pill */}
                  {isFirstTombstone && (
                    <div className="text-[9px] font-mono text-violet-300 text-center font-bold">
                      First Tombstone
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Probe Sequence Ribbon */}
      {probeSequence.length > 0 && collisionStrategy !== 'chaining' && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            Probe Chain ({collisionStrategy === 'linear-probing' ? 'h+i mod m' : 'h+i² mod m'}):
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {probeSequence.map((slotIdx, sIdx) => {
              const isFound = foundSlotIndex === slotIdx;
              return (
                <React.Fragment key={sIdx}>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg font-mono font-bold border ${
                      isFound
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : sIdx === probeSequence.length - 1
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    [{slotIdx}]
                  </span>
                  {sIdx < probeSequence.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
