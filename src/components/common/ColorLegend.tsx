import React from 'react';

export interface LegendItem {
  color: string;
  borderColor?: string;
  shape?: 'circle' | 'square' | 'triangle' | 'check' | 'dash' | 'badge';
  customSymbol?: string;
  label: string;
  description?: string;
}

interface ColorLegendProps {
  items?: LegendItem[];
}

export const defaultLegendItems: LegendItem[] = [
  {
    color: 'bg-amber-500',
    borderColor: 'border-amber-400',
    shape: 'square',
    label: 'Comparing',
  },
  {
    color: 'bg-brand-500',
    borderColor: 'border-brand-400',
    shape: 'circle',
    label: 'Swapping',
  },
  {
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    shape: 'check',
    label: 'Sorted',
  },
  {
    color: 'bg-rose-500',
    borderColor: 'border-rose-400',
    shape: 'triangle',
    label: 'Pivot',
  },
  {
    color: 'bg-slate-700',
    borderColor: 'border-slate-600',
    shape: 'dash',
    label: 'Unvisited',
  },
];

export const ColorLegend: React.FC<ColorLegendProps> = ({
  items = defaultLegendItems,
}) => {
  return (
    <div
      aria-label="Color and shape legend"
      className="flex flex-wrap items-center gap-2 px-2.5 py-1 bg-slate-900/60 dark:bg-slate-900/80 border border-slate-800 rounded-xl text-xs select-none"
    >
      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mr-1">
        Legend:
      </span>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5 text-slate-300">
          <span
            className={`min-w-[14px] h-3.5 px-1 rounded-sm flex items-center justify-center text-[9px] font-bold text-slate-950 ${item.color} ${
              item.borderColor ? `border ${item.borderColor}` : ''
            }`}
          >
            {item.customSymbol ? (
              <span>{item.customSymbol}</span>
            ) : item.shape === 'circle' ? (
              '●'
            ) : item.shape === 'triangle' ? (
              '▲'
            ) : item.shape === 'check' ? (
              '✓'
            ) : item.shape === 'dash' ? (
              '—'
            ) : (
              '■'
            )}
          </span>
          <span className="text-[11px] font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
