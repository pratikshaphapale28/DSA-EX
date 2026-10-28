import React from 'react';
import { usePlayerStore } from '../../engine/usePlayerStore';
import { CountersCard } from './CountersCard';
import { NarrationBox } from './NarrationBox';
import { PseudocodeViewer } from './PseudocodeViewer';
import { ComplexityCard } from './ComplexityCard';
import type { AlgorithmDefinition } from '../../types/algorithm';

interface InsightPanelProps {
  algorithm: AlgorithmDefinition<any, any, any>;
  inputSize: number;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  algorithm,
  inputSize,
}) => {
  const { getCurrentStep } = usePlayerStore();
  const currentStep = getCurrentStep();

  const activeLine = currentStep ? currentStep.codeLine : 1;
  const counters = currentStep
    ? currentStep.counters
    : { comparisons: 0, swaps: 0, iterations: 0, accesses: 0 };
  const actualOperations = counters.comparisons + counters.swaps;

  return (
    <aside
      className="w-full lg:w-80 xl:w-96 border-l border-slate-800 bg-slate-950/70 p-3 sm:p-4 space-y-3 overflow-y-auto shrink-0"
      aria-label="Algorithm Live Insight Panel"
    >
      {/* 1. Step Narration */}
      <NarrationBox step={currentStep} />

      {/* 2. Live Counters (Compact row of 4) */}
      <CountersCard counters={counters} />

      {/* 3. Pseudocode Tracker */}
      <PseudocodeViewer
        lines={algorithm.pseudocode}
        activeLine={activeLine}
      />

      {/* 4. Complexity Card */}
      <ComplexityCard
        complexity={algorithm.complexity}
        actualOperations={actualOperations}
        inputSize={inputSize}
        algorithmName={algorithm.name}
        showChart={algorithm.category === 'sorting'}
      />
    </aside>
  );
};
