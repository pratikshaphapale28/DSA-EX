import React, { useEffect, useRef } from 'react';
import { Code2, ChevronRight } from 'lucide-react';
import type { PseudocodeLine } from '../../types/algorithm';
import { usePlayerStore } from '../../engine/usePlayerStore';

interface PseudocodeViewerProps {
  lines: PseudocodeLine[];
  activeLine: number;
}

export const PseudocodeViewer: React.FC<PseudocodeViewerProps> = ({
  lines,
  activeLine,
}) => {
  const { autoScrollCode } = usePlayerStore();
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScrollCode && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeLine, autoScrollCode]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-accent-cyan" />
          Active Pseudocode
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Line {activeLine > 0 ? activeLine : '—'}
        </span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/90 font-mono text-xs overflow-hidden max-h-52 overflow-y-auto">
        <div className="divide-y divide-slate-800/40">
          {lines.map((item) => {
            const isActive = item.line === activeLine;
            return (
              <div
                key={item.line}
                ref={isActive ? activeLineRef : null}
                className={`flex items-start px-3 py-1.5 transition-colors ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-200 border-l-2 border-brand-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span
                  className={`w-6 shrink-0 select-none text-[11px] font-mono text-right mr-3 ${
                    isActive ? 'text-brand-300 font-bold' : 'text-slate-600'
                  }`}
                >
                  {item.line}
                </span>

                <div className="flex-1 flex items-center justify-between gap-2 overflow-x-auto">
                  <span className={isActive ? 'text-white' : 'text-slate-300'}>
                    {item.code}
                  </span>
                  {isActive && (
                    <span className="shrink-0 flex items-center text-[10px] bg-brand-500/30 text-brand-300 px-1.5 py-0.5 rounded">
                      <ChevronRight className="w-3 h-3" />
                      executing
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
