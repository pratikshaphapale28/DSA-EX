import React from 'react';
import type { StackQueueSnapshot } from '../../types/stack-queue';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface StackQueueVisualizerProps {
  snapshot: StackQueueSnapshot | null;
}

export const StackQueueVisualizer: React.FC<StackQueueVisualizerProps> = ({
  snapshot,
}) => {
  if (!snapshot) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
        Select a mode or run an operation to begin.
      </div>
    );
  }

  const {
    mode,
    items,
    capacity,
    topIndex = -1,
    frontIndex = 0,
    rearIndex = -1,
    count,
    isOverflow,
    isUnderflow,
    statusMessage,
    charIndex = 0,
    charStream = [],
    isMatchFailure,
  } = snapshot;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 space-y-4 min-h-[380px]">
      {/* Status & Error Banner */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOverflow ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40 animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              OVERFLOW: Capacity {capacity} Exceeded!
            </span>
          ) : isUnderflow ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              UNDERFLOW: Structure is Empty!
            </span>
          ) : isMatchFailure ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Bracket Syntax Error!
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {statusMessage || 'Normal State'}
            </span>
          )}
        </div>

        {/* Capacity Meter */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Capacity:</span>
          <span className="font-bold text-slate-200">
            {count} / {capacity}
          </span>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              style={{ width: `${Math.min(100, (count / capacity) * 100)}%` }}
              className={`h-full transition-all duration-300 ${
                count >= capacity ? 'bg-rose-500' : 'bg-brand-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* MODE 1: VERTICAL STACK (LIFO) */}
      {mode === 'stack' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs py-2">
          <div className="w-48 border-x-4 border-b-4 border-slate-700 bg-slate-950/70 rounded-b-2xl p-2 flex flex-col-reverse gap-2 shadow-2xl">
            {Array.from({ length: capacity }).map((_, idx) => {
              const val = items[idx];
              const isTop = idx === topIndex;
              const isOccupied = idx <= topIndex && val !== null && val !== undefined;

              return (
                <div
                  key={idx}
                  className={`h-11 rounded-xl flex items-center justify-between px-3 border transition-all duration-300 relative ${
                    isTop
                      ? 'bg-brand-600 border-brand-300 text-white shadow-glow'
                      : isOccupied
                      ? 'bg-slate-800 border-slate-600 text-slate-100'
                      : 'bg-slate-900/40 border-dashed border-slate-800 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 select-none">
                    [{idx}]
                  </span>
                  <span className="font-mono font-bold text-sm">
                    {isOccupied ? val : '—'}
                  </span>

                  {/* Top Pointer Badge */}
                  {isTop && (
                    <div className="absolute -right-24 flex items-center gap-1 z-10 animate-bounce">
                      <span className="text-brand-400">←</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500 text-white">
                        TOP ({topIndex})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-xs font-mono font-semibold text-slate-400 mt-3 px-3 py-1 bg-slate-900/80 rounded-md border border-slate-800">
            Bottom of Stack [Index 0]
          </div>
        </div>
      )}

      {/* MODE 2: LINEAR QUEUE (FIFO) */}
      {mode === 'queue' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl py-6">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400">
            <span className="text-emerald-400">Dequeue (Front)</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-brand-400">Enqueue (Rear)</span>
          </div>

          <div className="flex items-center justify-center gap-2 w-full p-4 bg-slate-950/70 border-y-2 border-slate-800 rounded-2xl">
            {Array.from({ length: capacity }).map((_, idx) => {
              const val = items[idx];
              const isFront = idx === frontIndex && count > 0;
              const isRear = idx === rearIndex && count > 0;
              const isOccupied = val !== null && val !== undefined;

              return (
                <div key={idx} className="flex-1 max-w-[64px] flex flex-col items-center relative">
                  {/* Pointers on top */}
                  <div className="h-6 flex items-center justify-center mb-1">
                    {isFront && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-sm whitespace-nowrap">
                        FRONT
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-full h-14 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 ${
                      isFront
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                        : isRear
                        ? 'bg-brand-600/30 border-brand-400 text-brand-200'
                        : isOccupied
                        ? 'bg-slate-800 border-slate-600 text-slate-100'
                        : 'bg-slate-900/40 border-dashed border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-mono font-bold text-sm">
                      {isOccupied ? val : '—'}
                    </span>
                  </div>

                  {/* Rear pointer underneath */}
                  <div className="h-6 flex items-center justify-center mt-1">
                    {isRear && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-600 text-white shadow-sm whitespace-nowrap">
                        REAR
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: CIRCULAR QUEUE (RING BUFFER) */}
      {mode === 'circular-queue' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full py-2">
          {(() => {
            // Radial layout of slots in a circular ring
            const radius = 90;
            const centerX = 150;
            const centerY = 120;

            return (
              <div className="relative">
                <svg viewBox="0 0 300 240" className="w-72 h-60 overflow-visible">
                  {/* Background Track Circle */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="32"
                    strokeDasharray="4 4"
                  />

                  {/* Circular slots */}
                  {Array.from({ length: capacity }).map((_, idx) => {
                    const angle = (idx / capacity) * 2 * Math.PI - Math.PI / 2;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);

                    const val = items[idx];
                    const isFront = idx === frontIndex && count > 0;
                    const isRear = idx === rearIndex && count > 0;
                    const isOccupied = val !== null && val !== undefined;

                    return (
                      <g key={idx} className="transition-all duration-300">
                        {/* Slot Circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r={20}
                          className={`transition-colors duration-300 ${
                            isFront
                              ? 'fill-emerald-600 stroke-emerald-300 stroke-2'
                              : isRear
                              ? 'fill-brand-600 stroke-brand-300 stroke-2'
                              : isOccupied
                              ? 'fill-slate-800 stroke-slate-500 stroke-2'
                              : 'fill-slate-900 stroke-slate-700 stroke-1'
                          }`}
                        />
                        {/* Slot Value */}
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          className="text-xs font-mono font-bold fill-white select-none"
                        >
                          {isOccupied ? val : '—'}
                        </text>

                        {/* Slot Index */}
                        <text
                          x={x + 18 * Math.cos(angle)}
                          y={y + 18 * Math.sin(angle) + 3}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-400 select-none"
                        >
                          {idx}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center Info Hub */}
                  <circle cx={centerX} cy={centerY} r={46} className="fill-slate-950 stroke-slate-800" />
                  <text
                    x={centerX}
                    y={centerY - 8}
                    textAnchor="middle"
                    className="text-[10px] font-mono font-semibold fill-emerald-400"
                  >
                    Front: {count > 0 ? frontIndex : 'none'}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 8}
                    textAnchor="middle"
                    className="text-[10px] font-mono font-semibold fill-brand-400"
                  >
                    Rear: {count > 0 ? rearIndex : 'none'}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 22}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400"
                  >
                    Count: {count}/{capacity}
                  </text>
                </svg>
              </div>
            );
          })()}
        </div>
      )}

      {/* MODE 4: BALANCED PARENTHESES DEMO */}
      {mode === 'parentheses' && (
        <div className="flex-1 flex flex-col items-center justify-between w-full max-w-lg py-4 space-y-6">
          {/* Character stream ribbon */}
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[11px] font-mono text-slate-400 mb-2">
              Expression Character Stream
            </span>
            <div className="flex items-center gap-2">
              {charStream.map((ch, idx) => {
                const isCurrent = idx === charIndex;
                const isProcessed = idx < charIndex;

                return (
                  <div key={idx} className="flex flex-col items-center relative">
                    <div
                      className={`w-9 h-10 rounded-lg flex items-center justify-center font-mono text-base font-bold transition-all ${
                        isCurrent
                          ? 'bg-brand-500 text-white shadow-glow scale-110'
                          : isProcessed
                          ? 'bg-slate-800/60 text-slate-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {ch}
                    </div>
                    {isCurrent && (
                      <span className="text-brand-400 text-xs font-bold mt-1 animate-bounce">
                        ▲
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active bracket stack */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-mono text-slate-400 mb-1">
              Active Bracket Stack (Depth: {items.length})
            </span>
            <div className="w-48 border-x-2 border-b-2 border-slate-700 bg-slate-950 rounded-b-xl p-2 min-h-[100px] flex flex-col-reverse gap-1.5">
              {items.length === 0 ? (
                <div className="text-center text-slate-600 text-xs py-4 font-mono">
                  Stack is empty
                </div>
              ) : (
                items.map((b, idx) => (
                  <div
                    key={idx}
                    className="h-8 rounded bg-brand-500/20 border border-brand-400/40 text-brand-300 font-mono font-bold flex items-center justify-center text-base"
                  >
                    {b}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
