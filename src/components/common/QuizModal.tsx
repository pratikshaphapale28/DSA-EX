import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAppStore } from '../../store/useAppStore';
import { usePlayerStore } from '../../engine/usePlayerStore';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react';

interface QuizOption {
  id: string;
  label: string;
  explanation: string;
  isCorrect: boolean;
}

export const QuizModal: React.FC = () => {
  const { isQuizModalOpen, setIsQuizModalOpen } = useAppStore();
  const { steps, currentStepIndex, nextStep } = usePlayerStore();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const currentStep = steps[currentStepIndex];
  const nextStepItem = steps[currentStepIndex + 1];

  // Reset state when opened or step changes
  useEffect(() => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
  }, [isQuizModalOpen, currentStepIndex]);

  // Generate dynamic options based on next step
  const generateOptions = (): QuizOption[] => {
    if (!nextStepItem) return [];

    const correctType = nextStepItem.type;

    switch (correctType) {
      case 'compare':
        return [
          {
            id: 'opt-compare',
            label: 'Compare active pair without modifying values',
            explanation: 'Correct! The algorithm must evaluate the ordering condition first before making any swaps or splits.',
            isCorrect: true,
          },
          {
            id: 'opt-swap',
            label: 'Directly swap positions immediately',
            explanation: 'Incorrect: The algorithm must first compare the values to check if they violate sorted order.',
            isCorrect: false,
          },
          {
            id: 'opt-finish',
            label: 'Terminate and declare the structure complete',
            explanation: 'Incorrect: Unchecked elements still remain in the collection.',
            isCorrect: false,
          },
        ];

      case 'swap':
        return [
          {
            id: 'opt-swap',
            label: 'Exchange (swap) the out-of-order elements',
            explanation: 'Correct! The comparison revealed inverted values that need to be swapped to restore invariant order.',
            isCorrect: true,
          },
          {
            id: 'opt-ignore',
            label: 'Leave values as-is and jump to the next pass',
            explanation: 'Incorrect: Since the pair was inverted, a swap is strictly required by the algorithm.',
            isCorrect: false,
          },
          {
            id: 'opt-rehash',
            label: 'Double capacity and trigger full rehash',
            explanation: 'Incorrect: Swapping in array sorts does not trigger capacity changes.',
            isCorrect: false,
          },
        ];

      case 'visit':
        return [
          {
            id: 'opt-visit',
            label: 'Mark target node as visited and explore outgoing frontier',
            explanation: 'Correct! Traversing graphs/trees inspects the frontier vertex and queues unvisited neighbors.',
            isCorrect: true,
          },
          {
            id: 'opt-backtrack',
            label: 'Halt traversal and clear the frontier queue',
            explanation: 'Incorrect: The search continues until all reachable nodes are settled or the target is found.',
            isCorrect: false,
          },
          {
            id: 'opt-rebalance',
            label: 'Trigger an AVL double rotation',
            explanation: 'Incorrect: Standard graph traversals do not modify vertex tree balance.',
            isCorrect: false,
          },
        ];

      case 'complete':
        return [
          {
            id: 'opt-complete',
            label: 'Algorithm reaches completion (invariants satisfied)',
            explanation: 'Correct! All items have been processed and the goal state is achieved.',
            isCorrect: true,
          },
          {
            id: 'opt-continue',
            label: 'Repeat from index 0 indefinitely',
            explanation: 'Incorrect: The termination condition has been reached.',
            isCorrect: false,
          },
          {
            id: 'opt-throw',
            label: 'Signal error and reset counters',
            explanation: 'Incorrect: The execution finished normally.',
            isCorrect: false,
          },
        ];

      default:
        return [
          {
            id: 'opt-advance',
            label: `Execute ${correctType.toUpperCase()} state transition`,
            explanation: `Correct! The algorithm proceeds to the ${correctType} operation.`,
            isCorrect: true,
          },
          {
            id: 'opt-skip',
            label: 'Skip operation and jump to end',
            explanation: 'Incorrect: Steps must execute sequentially.',
            isCorrect: false,
          },
          {
            id: 'opt-abort',
            label: 'Abort execution early',
            explanation: 'Incorrect: Normal progression continues.',
            isCorrect: false,
          },
        ];
    }
  };

  const options = generateOptions();
  const selectedOption = options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const handleStepForwardAndClose = () => {
    nextStep();
    setIsQuizModalOpen(false);
  };

  return (
    <Modal
      isOpen={isQuizModalOpen}
      onClose={() => setIsQuizModalOpen(false)}
      title="Predict the Next Step"
      maxWidth="md"
    >
      <div className="space-y-4">
        {!nextStepItem ? (
          <div className="text-center py-6 space-y-2">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-100">Algorithm is at the Final Step</h3>
            <p className="text-xs text-slate-400">
              Reset or step backward to test your prediction skills on earlier state transitions!
            </p>
          </div>
        ) : (
          <>
            {/* Context Prompt */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300">
                <BrainCircuit className="w-4 h-4 text-brand-400" />
                <span>Current State: Step {currentStepIndex + 1} of {steps.length}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                "{currentStep?.description}"
              </p>
            </div>

            {/* Question */}
            <div>
              <h3 className="text-sm font-bold text-slate-100 mb-2">
                What do you predict will happen in Step {currentStepIndex + 2}?
              </h3>

              <div className="space-y-2">
                {options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  let optionStyles = 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700';

                  if (hasSubmitted) {
                    if (option.isCorrect) {
                      optionStyles = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200';
                    } else if (isSelected && !option.isCorrect) {
                      optionStyles = 'bg-rose-950/40 border-rose-500/60 text-rose-200';
                    }
                  } else if (isSelected) {
                    optionStyles = 'bg-brand-500/20 border-brand-500 text-brand-200 shadow-glow';
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (!hasSubmitted) {
                          setSelectedOptionId(option.id);
                        }
                      }}
                      disabled={hasSubmitted}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-start gap-3 ${optionStyles}`}
                    >
                      <div className="mt-0.5">
                        {hasSubmitted && option.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : hasSubmitted && isSelected && !option.isCorrect ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <div className={`w-3.5 h-3.5 rounded-full border ${isSelected ? 'border-brand-400 bg-brand-500' : 'border-slate-600'}`} />
                        )}
                      </div>
                      <span className="flex-1 leading-relaxed">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Banner */}
            {hasSubmitted && selectedOption && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-bold mb-0.5">
                    {isCorrect ? 'Correct Intuition! 🎉' : 'Learning Moment:'}
                  </strong>
                  <span>{selectedOption.explanation}</span>
                </div>
              </div>
            )}

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {!hasSubmitted ? (
                <button
                  onClick={() => {
                    if (selectedOptionId) setHasSubmitted(true);
                  }}
                  disabled={!selectedOptionId}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all"
                >
                  Confirm Prediction
                </button>
              ) : (
                <button
                  onClick={handleStepForwardAndClose}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-glow-emerald transition-all"
                >
                  <span>Step Forward & Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
