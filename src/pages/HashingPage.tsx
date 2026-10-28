import React, { useState, useEffect, useCallback } from 'react';
import { generateHashSteps, getNextPrime } from '../algorithms/hashing/hashTable';
import { HashVisualizer } from '../components/visualizers/HashVisualizer';
import { InsightPanel } from '../components/insights/InsightPanel';
import { ColorLegend, type LegendItem } from '../components/common/ColorLegend';
import { usePlayerStore } from '../engine/usePlayerStore';
import type { CollisionStrategy, HashFunctionType, HashSnapshot } from '../types/hash';
import type { AlgorithmDefinition, Step } from '../types/algorithm';
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const hashingLegendItems: LegendItem[] = [
  { label: 'Occupied', color: 'bg-slate-800', borderColor: 'border-slate-700', shape: 'square' },
  { label: 'Probing', color: 'bg-cyan-500/20', borderColor: 'border-cyan-500', customSymbol: '#' },
  { label: 'Matched', color: 'bg-emerald-500/20', borderColor: 'border-emerald-500', shape: 'check' },
  { label: 'Tombstone', color: 'bg-amber-500/20', borderColor: 'border-amber-500', customSymbol: 'DEL' },
  { label: '1st Del', color: 'bg-purple-500/20', borderColor: 'border-purple-500', customSymbol: '1st' },
  { label: 'Empty', color: 'bg-slate-900', borderColor: 'border-slate-800', shape: 'dash' },
];

export const HashingPage: React.FC = () => {
  const [collisionStrategy, setCollisionStrategy] = useState<CollisionStrategy>('linear-probing');
  const [hashFunction, setHashFunction] = useState<HashFunctionType>('division');
  const [capacity, setCapacity] = useState<number>(7);
  const [currentTable, setCurrentTable] = useState<import('../types/hash').TableSlot[] | null>(null);
  const [currentChains, setCurrentChains] = useState<import('../types/hash').HashEntry[][] | null>(null);
  const [entries, setEntries] = useState<{ key: string | number; val: string | number }[]>([
    { key: 10, val: 10 },
    { key: 17, val: 17 },
    { key: 24, val: 24 },
  ]);

  const [inputKey, setInputKey] = useState<string>('31');
  const [inputVal, setInputVal] = useState<string>('31');
  const [activeOp, setActiveOp] = useState<'insert' | 'search' | 'delete'>('insert');

  const { mode, setSteps, getCurrentStep } = usePlayerStore();
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(mode === 'beginner');

  const currentStep = getCurrentStep() as Step<HashSnapshot, Record<string, unknown>> | null;

  // Keep isAboutExpanded synced when mode toggles
  useEffect(() => {
    setIsAboutExpanded(mode === 'beginner');
  }, [mode]);

  // Execute operation and generate steps
  const executeOperation = useCallback(
    (
      opType: 'insert' | 'search' | 'delete' | 'rehash',
      keyToUse: string | number,
      valToUse?: string | number,
      targetCapacity?: number,
      overrideTable?: import('../types/hash').TableSlot[] | null,
      overrideChains?: import('../types/hash').HashEntry[][] | null
    ) => {
      const parsedKey =
        hashFunction === 'string-poly' || isNaN(Number(keyToUse))
          ? String(keyToUse)
          : Number(keyToUse);

      const parsedVal = valToUse !== undefined ? valToUse : parsedKey;
      const effectiveCap = targetCapacity ?? capacity;

      const activeTableToUse = overrideTable !== undefined ? overrideTable : currentTable;
      const activeChainsToUse = overrideChains !== undefined ? overrideChains : currentChains;

      const steps = generateHashSteps({
        capacity: effectiveCap,
        collisionStrategy,
        hashFunction,
        initialEntries: entries,
        initialTable: activeTableToUse && activeTableToUse.length === effectiveCap ? activeTableToUse : undefined,
        initialChains: activeChainsToUse && activeChainsToUse.length === effectiveCap ? activeChainsToUse : undefined,
        operation: {
          type: opType,
          key: parsedKey,
          val: parsedVal,
          newCapacity: opType === 'rehash' ? effectiveCap : undefined,
        },
      });

      setSteps(steps);

      const lastStep = steps[steps.length - 1];
      if (lastStep && lastStep.state) {
        const finalState = lastStep.state;
        setCurrentTable(finalState.table);
        if (finalState.chains) setCurrentChains(finalState.chains);

        if (opType === 'insert' && !finalState.isDuplicateRejected && !finalState.isProbeFailed && !finalState.isTableFull) {
          if (!entries.some((e) => e.key === parsedKey)) {
            setEntries((prev) => [...prev, { key: parsedKey, val: parsedVal }]);
          }
        } else if (opType === 'delete') {
          setEntries((prev) => prev.filter((e) => e.key !== parsedKey));
        } else if (opType === 'rehash') {
          setCapacity(effectiveCap);
        }
      }
    },
    [capacity, collisionStrategy, hashFunction, entries, currentTable, currentChains, setSteps]
  );

  // Initial load
  useEffect(() => {
    executeOperation('insert', inputKey, inputVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collisionStrategy, hashFunction, capacity]);

  // Handle Resize / Rehash
  const handleTriggerRehash = () => {
    const newCap =
      collisionStrategy === 'quadratic-probing'
        ? getNextPrime(capacity * 2)
        : capacity * 2;
    executeOperation('rehash', 'REHASH', 'REHASH', newCap);
  };

  // Submit manual operation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    executeOperation(activeOp, inputKey, inputVal);
  };

  // Educational Presets
  const applyPreset = (presetIndex: number) => {
    if (presetIndex === 0) {
      // Tombstones Demo
      const cap = 7;
      setCapacity(cap);
      setCollisionStrategy('linear-probing');
      setHashFunction('division');
      const baseEntries = [
        { key: 10, val: 10 },
        { key: 17, val: 17 },
        { key: 24, val: 24 },
      ];
      setEntries(baseEntries);
      setInputKey('24');
      setInputVal('24');
      setActiveOp('search');

      const initialTable: import('../types/hash').TableSlot[] = Array.from({ length: cap }, () => null);
      initialTable[3] = { key: 10, val: 10, isTombstone: false };
      initialTable[4] = { key: 'DEL', val: 'DEL', isTombstone: true };
      initialTable[5] = { key: 24, val: 24, isTombstone: false };

      setCurrentTable(initialTable);
      setCurrentChains(null);
      executeOperation('search', 24, 24, cap, initialTable, null);
    } else if (presetIndex === 1) {
      // Quad Probe Failure
      const cap = 6;
      setCapacity(cap);
      setCollisionStrategy('quadratic-probing');
      setHashFunction('division');
      const quadEntries = [
        { key: 6, val: 6 },
        { key: 12, val: 12 },
        { key: 18, val: 18 },
        { key: 24, val: 24 },
      ];
      setEntries(quadEntries);
      setInputKey('30');
      setInputVal('30');
      setActiveOp('insert');

      const initialTable: import('../types/hash').TableSlot[] = Array.from({ length: cap }, () => null);
      initialTable[0] = { key: 6, val: 6, isTombstone: false };
      initialTable[1] = { key: 12, val: 12, isTombstone: false };
      initialTable[3] = { key: 24, val: 24, isTombstone: false };
      initialTable[4] = { key: 18, val: 18, isTombstone: false };

      setCurrentTable(initialTable);
      setCurrentChains(null);
      executeOperation('insert', 30, 30, cap, initialTable, null);
    } else if (presetIndex === 2) {
      // Chaining Strings
      const cap = 5;
      setCapacity(cap);
      setCollisionStrategy('chaining');
      setHashFunction('string-poly');
      const stringEntries = [
        { key: 'apple', val: 100 },
        { key: 'banana', val: 200 },
        { key: 'cherry', val: 300 },
      ];
      setEntries(stringEntries);
      setInputKey('date');
      setInputVal('400');
      setActiveOp('insert');
      setCurrentTable(null);
      setCurrentChains(null);
      executeOperation('insert', 'date', 400, cap, null, null);
    } else if (presetIndex === 3) {
      // Multiplication
      const cap = 8;
      setCapacity(cap);
      setCollisionStrategy('linear-probing');
      setHashFunction('multiplication');
      const multEntries = [
        { key: 123, val: 123 },
        { key: 456, val: 456 },
        { key: 789, val: 789 },
      ];
      setEntries(multEntries);
      setInputKey('999');
      setInputVal('999');
      setActiveOp('insert');
      setCurrentTable(null);
      setCurrentChains(null);
      executeOperation('insert', 999, 999, cap, null, null);
    }
  };

  const currentAlgorithm: AlgorithmDefinition<any, HashSnapshot, any> = {
    id: 'hash-table',
    name: 'Hash Table',
    category: 'hashing',
    description: `Hash Table with ${collisionStrategy.replace('-', ' ')} and ${hashFunction} hashing.`,
    realWorldAnalogy: 'A coat-check room with numbered pegs for keys, using linked overflow or adjacent slots for collisions.',
    complexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(N)',
      plainEnglish: 'Expected O(1) constant time lookup when load factor is kept below threshold.',
      space: 'O(N)',
    },
    pseudocode: [
      { line: 1, code: 'hash = hash_fn(key) % capacity', explanation: 'Compute base bucket index' },
      { line: 2, code: 'if slot == empty: insert(key, val)', explanation: 'Store key if slot is free' },
      { line: 3, code: 'else: probe or chain to next slot', explanation: 'Resolve collision' },
      { line: 4, code: 'if load_factor > 0.7: rehash()', explanation: 'Resize table' },
    ],
    generateSteps: () => [],
    defaultInput: null,
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 h-full overflow-hidden">
      {/* Center Visualization Canvas */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 pb-20 space-y-2.5 overflow-y-auto">
        {/* 1. Algorithm Tabs Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ['linear-probing', 'Linear Probing'],
                ['quadratic-probing', 'Quadratic Probing'],
                ['chaining', 'Chaining'],
              ] as const
            ).map(([strat, label]) => (
              <button
                key={strat}
                onClick={() => setCollisionStrategy(strat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  collisionStrategy === strat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={hashFunction}
              onChange={(e) => setHashFunction(e.target.value as HashFunctionType)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
            >
              <option value="division">Division (k mod m)</option>
              <option value="multiplication">Multiplication</option>
              <option value="string-poly">String Polynomial</option>
            </select>

            <select
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              title="Table Capacity (m)"
            >
              {[5, 6, 7, 8, 11, 13].map((cap) => (
                <option key={cap} value={cap}>
                  m={cap}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. "About this algorithm" collapsible line */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <button
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-white transition-colors text-left"
            aria-expanded={isAboutExpanded}
          >
            <span>About Hash Table</span>
            {isAboutExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            )}
          </button>

          {isAboutExpanded && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
              <p>{currentAlgorithm.description}</p>
              {currentAlgorithm.realWorldAnalogy && (
                <p className="text-brand-300">
                  <strong className="text-brand-400">Real-World Analogy: </strong>
                  {currentAlgorithm.realWorldAnalogy}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3. Single Compact Input Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Presets:</span>
            <button
              onClick={() => applyPreset(0)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Tombstones Demo
            </button>
            <button
              onClick={() => applyPreset(1)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Quad Probe Failure
            </button>
            <button
              onClick={() => applyPreset(2)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Chaining Strings
            </button>
            <button
              onClick={() => applyPreset(3)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            >
              Multiplication
            </button>
          </div>

          {/* Form & Actions in same row */}
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
              {(['insert', 'search', 'delete'] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setActiveOp(op)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                    activeOp === op ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Key"
              className="w-20 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
            />

            <button
              type="submit"
              className="px-2.5 py-0.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded shadow-sm text-xs capitalize"
            >
              Run
            </button>

            <button
              type="button"
              onClick={handleTriggerRehash}
              className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded border border-slate-700 text-xs"
              title="Double capacity & rehash"
            >
              <RefreshCw className="w-3 h-3 text-brand-400" />
              <span>Rehash</span>
            </button>
          </form>
        </div>

        {/* 4. Canvas Area (Centered content, 300-350px height) */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-center p-3 h-[300px] sm:h-[350px] relative overflow-hidden">
          <HashVisualizer
            snapshot={currentStep?.state || null}
            onTriggerRehash={handleTriggerRehash}
          />
        </div>

        {/* 5. Legend directly under the canvas as one short row */}
        <ColorLegend items={hashingLegendItems} />
      </div>

      {/* Right Live Insight Panel */}
      <InsightPanel
        algorithm={currentAlgorithm}
        inputSize={capacity}
      />
    </div>
  );
};
