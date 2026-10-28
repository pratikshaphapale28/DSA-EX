import React, { useState } from 'react';
import { MessageSquareText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlayerStore } from '../../engine/usePlayerStore';
import type { Step } from '../../types/algorithm';

interface NarrationBoxProps {
  step: Step<any, any> | null;
}

export const NarrationBox: React.FC<NarrationBoxProps> = ({ step }) => {
  const { mode } = usePlayerStore();
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);

  if (!step) {
    return (
      <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs text-center">
        Press <strong>Play</strong> or <strong>Next</strong> to begin.
      </div>
    );
  }

  const isCompleted = step.type === 'complete';

  // Format narration to one single sentence (max ~20 words in beginner, ~14 in advanced)
  const formatNarration = (text: string, maxWords: number): string => {
    if (!text) return '';
    const match = text.match(/^[^.!?]+[.!?]/);
    const firstSentence = match ? match[0].trim() : text.trim();
    const words = firstSentence.split(/\s+/);
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return firstSentence;
  };

  const narrationText = formatNarration(step.description, mode === 'beginner' ? 20 : 14);

  // Fallback intuition if explanationDetail is missing
  const getFallbackIntuition = (type: string): string => {
    switch (type) {
      case 'compare':
        return 'Compares values without mutating data to choose the next branch.';
      case 'swap':
        return 'Swaps values into their correct relative positions.';
      case 'visit':
      case 'explore':
        return 'Marks element to avoid cycles and process reachable states.';
      case 'insert':
        return 'Inserts element while preserving ordering and structural invariants.';
      case 'delete':
        return 'Removes element while re-linking and re-balancing.';
      case 'rehash':
        return 'Resizes table to lower load factor and avoid collisions.';
      case 'rotate':
        return 'Restores balance in O(1) time without altering order.';
      case 'complete':
        return 'All conditions satisfied; execution completed.';
      default:
        return 'Executes next step according to the algorithm.';
    }
  };

  const whyText = step.explanationDetail || getFallbackIntuition(step.type);

  return (
    <div
      className={`p-3 rounded-xl border transition-all text-xs ${
        isCompleted
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : 'bg-slate-900/80 border-slate-800 text-slate-100'
      }`}
      data-testid={`narration-box-${mode}`}
    >
      <div className="flex items-start gap-2">
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <MessageSquareText className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 space-y-1">
          <p className="font-medium leading-relaxed">
            {narrationText}
            {/* "Why?" link visible only in Beginner mode */}
            {mode === 'beginner' && (
              <button
                onClick={() => setIsWhyExpanded(!isWhyExpanded)}
                className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
                aria-expanded={isWhyExpanded}
                aria-label="Toggle explanation of why this step matters"
              >
                <span>Why?</span>
                {isWhyExpanded ? (
                  <ChevronUp className="w-3 h-3 inline" />
                ) : (
                  <ChevronDown className="w-3 h-3 inline" />
                )}
              </button>
            )}
          </p>

          {/* Collapsed explanation revealed only when "Why?" is clicked */}
          {mode === 'beginner' && isWhyExpanded && (
            <div className="pt-1.5 mt-1 border-t border-slate-800 text-[11px] text-slate-300 leading-normal animate-fadeIn">
              <strong className="text-amber-300">Why this matters: </strong>
              {whyText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
