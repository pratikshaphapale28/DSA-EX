import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Compass,
  Play,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Sliders,
  Code2,
  CheckCircle,
} from 'lucide-react';

interface TourStep {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to DSA Explorer',
    tagline: 'Interactive visual algorithm exploration',
    description:
      'Watch sorting, searching, stacks, queues, trees, graphs, and hash tables execute step by step. Every animation is an immutable state snapshot with zero visual glitching.',
    icon: <Compass className="w-8 h-8 text-brand-400" />,
  },
  {
    title: 'Interactive Visualizer Canvas',
    tagline: 'Custom inputs & dynamic structures',
    description:
      'Add nodes, connect graph edges, rotate AVL trees, or test circular ring buffers. Each module has pre-configured educational presets to demonstrate edge cases and rotations.',
    icon: <Sliders className="w-8 h-8 text-cyan-400" />,
  },
  {
    title: 'Time-Travel Scrubber & Controls',
    tagline: 'Step backward or forward in time',
    description:
      'Control playback at 0.25x to 4x speed. Step backward to inspect previous states without recomputing. Use Space to play/pause, Left/Right arrows to step, and R to reset.',
    icon: <Play className="w-8 h-8 text-emerald-400" />,
  },
  {
    title: 'Live Insight & Pseudocode Panel',
    tagline: 'Synchronized code tracking & counters',
    description:
      'Follow the yellow highlighted pseudocode line as it executes. Watch real-time comparison counters, memory accesses, and plain-English "Why this matters" explanations.',
    icon: <Code2 className="w-8 h-8 text-amber-400" />,
  },
  {
    title: 'Beginner vs Advanced Mode',
    tagline: 'Customized for your learning pace',
    description:
      'Toggle Beginner Mode for conversational narration and real-world analogies, or switch to Advanced Mode for compact metrics and Big-O mathematical formulas.',
    icon: <Sparkles className="w-8 h-8 text-violet-400" />,
  },
];

export const GuidedTour: React.FC = () => {
  const { isTourOpen, setIsTourOpen } = useAppStore();
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isTourOpen) return null;

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      setIsTourOpen(false);
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    setIsTourOpen(false);
    setCurrentStep(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 select-none overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/15 text-brand-300 border border-brand-500/30">
              Guided Tour • Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close guided tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
            {step.icon}
          </div>

          <div>
            <h2 id="tour-modal-title" className="text-xl font-bold text-slate-100">
              {step.title}
            </h2>
            <p className="text-xs font-semibold text-brand-400 mt-0.5">
              {step.tagline}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            {step.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {tourSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-6 bg-brand-500'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={handleClose}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-400 text-white shadow-md transition-all"
            >
              {isLast ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Get Started!</span>
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
