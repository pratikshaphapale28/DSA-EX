import React from 'react';
import type { StepCounters } from '../../types/algorithm';

interface CountersCardProps {
  counters: StepCounters;
}

export const CountersCard: React.FC<CountersCardProps> = ({ counters }) => {
  const metrics = [
    { label: 'Comp', full: 'Comparisons', value: counters.comparisons, color: 'text-amber-400' },
    { label: 'Swaps', full: 'Swaps / Writes', value: counters.swaps, color: 'text-brand-400' },
    { label: 'Passes', full: 'Iterations', value: counters.iterations, color: 'text-cyan-400' },
    { label: 'Access', full: 'Accesses', value: counters.accesses, color: 'text-emerald-400' },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 select-none">
      <div className="grid grid-cols-4 divide-x divide-slate-800/80 text-center">
        {metrics.map((m) => (
          <div key={m.label} className="px-1" title={m.full}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight truncate">
              {m.label}
            </div>
            <div className={`text-sm font-bold font-mono tracking-tight ${m.color}`}>
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
