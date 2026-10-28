export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'stack-queue'
  | 'trees'
  | 'graphs'
  | 'hashing';

export type StepType =
  | 'start'
  | 'compare'
  | 'swap'
  | 'assign'
  | 'visit'
  | 'enqueue'
  | 'dequeue'
  | 'push'
  | 'pop'
  | 'peek'
  | 'relax'
  | 'rotate-left'
  | 'rotate-right'
  | 'rotate-lr'
  | 'rotate-rl'
  | 'insert'
  | 'delete'
  | 'probe'
  | 'found'
  | 'not-found'
  | 'partition'
  | 'split'
  | 'merge'
  | 'rehash'
  | 'complete';

export interface StepCounters {
  comparisons: number;
  swaps: number;
  iterations: number;
  accesses: number;
}

export interface Step<TState = unknown, TAuxiliary = Record<string, unknown>> {
  id: number;
  type: StepType;
  description: string;
  explanationDetail?: string;
  codeLine: number; // 1-indexed line in pseudocode
  highlightedIndices?: number[];
  secondaryIndices?: number[];
  highlightedNodes?: string[];
  highlightedEdges?: [string, string][];
  state: TState;
  auxiliaryState: TAuxiliary;
  counters: StepCounters;
}

export interface PseudocodeLine {
  line: number;
  code: string;
  explanation: string;
}

export interface ComplexityMetric {
  best: string;
  average: string;
  worst: string;
  plainEnglish: string;
  space: string;
}

export interface AlgorithmDefinition<TInput = unknown, TState = unknown, TAuxiliary = Record<string, unknown>> {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  realWorldAnalogy: string;
  complexity: ComplexityMetric;
  pseudocode: PseudocodeLine[];
  generateSteps: (input: TInput) => Step<TState, TAuxiliary>[];
  defaultInput: TInput;
  sampleInputs?: { label: string; input: TInput }[];
  validateInput?: (input: TInput) => { valid: boolean; error?: string };
}
