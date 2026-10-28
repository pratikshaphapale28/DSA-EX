import React from 'react';
import { Clock } from 'lucide-react';
import type { ComplexityMetric } from '../../types/algorithm';
import { OperationsChart } from './OperationsChart';
import { usePlayerStore } from '../../engine/usePlayerStore';

interface ComplexityCardProps {
  complexity: ComplexityMetric;
  actualOperations: number;
  inputSize: number;
  algorithmName?: string;
  showChart?: boolean;
}

export const ComplexityCard: React.FC<ComplexityCardProps> = ({
  complexity,
  actualOperations,
  inputSize,
  showChart = false,
}) => {
  const { mode } = usePlayerStore();

  return (
    <div className="space-y-2 select-none" data-testid={`complexity-card-${mode}`}>
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          Complexity Analysis
        </span>
        <span className="font-mono text-[10px] text-brand-400 font-semibold bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
          N = {inputSize}
        </span>
      </div>

      <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2.5 text-xs">
        {/* Time Complexity compact 3-column row */}
        <div>
          <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span>Time Complexity</span>
            <span className="font-mono text-[10px] text-slate-500">Space: {complexity.space}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center font-mono">
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 font-sans">Best</div>
              <div className="text-xs font-bold text-emerald-400">{complexity.best}</div>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 font-sans">Average</div>
              <div className="text-xs font-bold text-amber-400">{complexity.average}</div>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-400 font-sans">Worst</div>
              <div className="text-xs font-bold text-rose-400">{complexity.worst}</div>
            </div>
          </div>
        </div>

        {/* Actual operations number */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
          <span className="text-slate-400">Actual Operations:</span>
          <span className="font-mono font-bold text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {actualOperations}
          </span>
        </div>

        {/* ONE plain-English line */}
        <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
          {complexity.plainEnglish}
        </div>
      </div>

      {/* Operations vs Input Size Chart */}
      {showChart && (
        <OperationsChart
          inputSize={inputSize}
          actualOperations={actualOperations}
          isNLogN={complexity.worst.includes('log')}
        />
      )}
    </div>
  );
};
