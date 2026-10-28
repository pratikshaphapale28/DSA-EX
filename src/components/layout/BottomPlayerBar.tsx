import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  HelpCircle,
} from 'lucide-react';
import { usePlayerStore } from '../../engine/usePlayerStore';
import { useAppStore } from '../../store/useAppStore';
import { Tooltip } from '../common/Tooltip';
import { Badge } from '../common/Badge';
import type { Step } from '../../types/algorithm';

export const BottomPlayerBar: React.FC = () => {
  const { activeView, setIsQuizModalOpen } = useAppStore();
  const {
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    togglePlay,
    nextStep,
    prevStep,
    reset,
    goToStep,
    setSpeed,
    getIsAtStart,
    getIsAtEnd,
  } = usePlayerStore();

  if (activeView === 'landing' || activeView === 'cheatsheet') {
    return null;
  }

  const totalSteps = steps.length;
  const currentStepNum = totalSteps > 0 ? currentStepIndex + 1 : 0;
  const currentStep = steps[currentStepIndex];
  const isAtEnd = totalSteps > 1 && currentStepIndex >= totalSteps - 1;

  const speedOptions = [0.25, 0.5, 1, 2, 4];

  // Specific step chip labeling
  const getStepBadgeText = (step: Step<any, any>): string => {
    if (step.type === 'partition') {
      if (activeView === 'sorting') {
        if (step.description.toLowerCase().includes('pass')) return 'NEW PASS';
        if (step.auxiliaryState?.partitionScheme) return 'PARTITION';
        return 'NEW PASS';
      }
      if (activeView === 'searching') {
        return 'NARROW RANGE';
      }
    }
    if (step.type === 'complete') return 'COMPLETE';
    return step.type.toUpperCase();
  };

  return (
    <div
      className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-3 sticky bottom-0 z-30 shadow-2xl"
      aria-label="Algorithm Playback Controls"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Timeline Slider with step marker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 shrink-0 w-24">
            Step {currentStepNum} / {totalSteps}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={currentStepIndex}
              onChange={(e) => goToStep(Number(e.target.value))}
              disabled={totalSteps <= 1}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Timeline scrubber slider"
            />
          </div>
          {currentStep && (
            <Badge
              variant={
                currentStep.type === 'complete'
                  ? 'success'
                  : currentStep.type === 'compare'
                  ? 'warning'
                  : 'brand'
              }
              size="sm"
            >
              {getStepBadgeText(currentStep)}
            </Badge>
          )}
        </div>

        {/* Action Controls & Visible Labels */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left: Replay Controls */}
          <div className="flex items-center gap-2">
            {/* Reset */}
            <Tooltip content="Reset to beginning (Shortcut: R)">
              <button
                onClick={reset}
                disabled={getIsAtStart()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Reset to beginning"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </Tooltip>

            {/* Prev */}
            <Tooltip content="Step backward (Shortcut: Left Arrow)">
              <button
                onClick={prevStep}
                disabled={getIsAtStart()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Step backward"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            </Tooltip>

            {/* Play/Pause/Replay */}
            <Tooltip
              content={
                isPlaying
                  ? 'Pause execution (Shortcut: Space)'
                  : isAtEnd
                  ? 'Replay from beginning (Shortcut: Space)'
                  : 'Play algorithm (Shortcut: Space)'
              }
            >
              <button
                onClick={togglePlay}
                disabled={totalSteps <= 1}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-md ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : isAtEnd
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-brand-600 hover:bg-brand-500 shadow-glow'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                aria-label={
                  isPlaying
                    ? 'Pause algorithm'
                    : isAtEnd
                    ? 'Replay algorithm'
                    : 'Play algorithm'
                }
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : isAtEnd ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-white" />
                    <span>Replay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </Tooltip>

            {/* Next */}
            <Tooltip content="Step forward (Shortcut: Right Arrow)">
              <button
                onClick={nextStep}
                disabled={getIsAtEnd()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Step forward"
              >
                <span>Next</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Predict Next Step Quiz Button */}
            <Tooltip content="Test your intuition: Predict what the next step will do!">
              <button
                onClick={() => setIsQuizModalOpen(true)}
                disabled={getIsAtEnd() || totalSteps <= 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Predict next step quiz"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Predict Step</span>
              </button>
            </Tooltip>
          </div>

          {/* Right: Speed Controls */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400 mr-1">
              <Gauge className="w-3.5 h-3.5 text-brand-400" />
              <span>Speed:</span>
            </span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                    speed === s
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  aria-label={`Set speed to ${s}x`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
