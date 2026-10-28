import React from 'react';
import { TrendingUp } from 'lucide-react';

interface OperationsChartProps {
  inputSize: number;
  actualOperations: number;
  algorithmCategory?: string;
  isNLogN?: boolean;
}

export const OperationsChart: React.FC<OperationsChartProps> = ({
  inputSize,
  actualOperations,
  isNLogN = false,
}) => {
  // Chart dimensions
  const width = 280;
  const height = 120;
  const padding = { top: 15, right: 20, bottom: 25, left: 35 };

  const maxN = 50;
  const maxOps = 600;

  // Scale helpers
  const scaleX = (n: number) => {
    return padding.left + (n / maxN) * (width - padding.left - padding.right);
  };

  const scaleY = (ops: number) => {
    const clamped = Math.min(ops, maxOps);
    return (
      height -
      padding.bottom -
      (clamped / maxOps) * (height - padding.top - padding.bottom)
    );
  };

  // Generate curve points for O(N^2)
  const n2Points = [5, 10, 15, 20, 25]
    .map((n) => `${scaleX(n)},${scaleY(n * n)}`)
    .join(' ');

  // Generate curve points for O(N log N)
  const nLogNPoints = [5, 10, 15, 20, 25, 30, 40, 50]
    .map((n) => `${scaleX(n)},${scaleY(n * Math.log2(n) * 2)}`)
    .join(' ');

  // Current execution point
  const currentX = scaleX(inputSize);
  const currentY = scaleY(actualOperations);

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-accent-cyan" />
          Operations vs Input Size (N)
        </span>
        <span className="text-[10px] text-brand-300 font-mono">
          N={inputSize} | Ops={actualOperations}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
        {/* Grid lines */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#334155"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Axis Labels */}
        <text
          x={width - padding.right}
          y={height - 8}
          textAnchor="end"
          className="text-[9px] fill-slate-500 font-mono"
        >
          N (size)
        </text>
        <text
          x={padding.left - 5}
          y={padding.top + 5}
          textAnchor="end"
          className="text-[9px] fill-slate-500 font-mono"
        >
          Ops
        </text>

        {/* Theoretical O(N^2) Curve */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth={!isNLogN ? '2.5' : '1.5'}
          strokeDasharray={!isNLogN ? 'none' : '3 2'}
          points={n2Points}
          opacity={!isNLogN ? 0.9 : 0.5}
        />
        <text
          x={scaleX(24)}
          y={scaleY(550)}
          className={`text-[8px] font-mono ${!isNLogN ? 'fill-amber-300 font-bold' : 'fill-amber-500'}`}
        >
          O(N²)
        </text>

        {/* Theoretical O(N log N) Curve */}
        <polyline
          fill="none"
          stroke="#06b6d4"
          strokeWidth={isNLogN ? '2.5' : '1.5'}
          strokeDasharray={isNLogN ? 'none' : '3 2'}
          points={nLogNPoints}
          opacity={isNLogN ? 0.9 : 0.5}
        />
        <text
          x={scaleX(45)}
          y={scaleY(280)}
          className={`text-[8px] font-mono ${isNLogN ? 'fill-cyan-300 font-bold' : 'fill-cyan-500'}`}
        >
          O(N log N)
        </text>

        {/* Current Run Plotted Point */}
        <circle
          cx={currentX}
          cy={currentY}
          r={5}
          className="fill-brand-500 stroke-white stroke-2 animate-pulse"
        />
        <text
          x={currentX + 8}
          y={currentY - 4}
          className="text-[10px] font-bold font-mono fill-brand-300"
        >
          ({actualOperations} ops)
        </text>
      </svg>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
        <span className={`flex items-center gap-1 ${isNLogN ? 'text-cyan-300 font-bold' : 'text-cyan-500'}`}>
          <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> O(N log N)
        </span>
        <span className={`flex items-center gap-1 ${!isNLogN ? 'text-amber-300 font-bold' : 'text-amber-500'}`}>
          <span className="w-2 h-0.5 bg-amber-400 inline-block" /> O(N²)
        </span>
        <span className="flex items-center gap-1 text-brand-400 font-semibold">
          ● Current Run
        </span>
      </div>
    </div>
  );
};
