import React from 'react';
import {
  ArrowUpDown,
  Search,
  Layers,
  GitFork,
  Network,
  Hash,
  Play,
  Compass,
} from 'lucide-react';
import { useAppStore, type AppView } from '../store/useAppStore';

interface ModuleCard {
  id: AppView;
  title: string;
  shortLine: string; // Max 10 words
  icon: React.ReactNode;
  accent: string;
  borderAccent: string;
}

const moduleCards: ModuleCard[] = [
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    shortLine: 'Watch arrays sort step by step with comparisons and swaps.',
    icon: <ArrowUpDown className="w-5 h-5 text-brand-400" />,
    accent: 'from-brand-500/10 to-transparent',
    borderAccent: 'border-brand-500/30 hover:border-brand-500/60',
  },
  {
    id: 'searching',
    title: 'Searching Algorithms',
    shortLine: 'Locate elements with step-by-step linear and binary searches.',
    icon: <Search className="w-5 h-5 text-cyan-400" />,
    accent: 'from-cyan-500/10 to-transparent',
    borderAccent: 'border-cyan-500/30 hover:border-cyan-500/60',
  },
  {
    id: 'stack-queue',
    title: 'Stack & Queue',
    shortLine: 'Push, pop, enqueue, and inspect circular ring buffers.',
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    accent: 'from-indigo-500/10 to-transparent',
    borderAccent: 'border-indigo-500/30 hover:border-indigo-500/60',
  },
  {
    id: 'trees',
    title: 'Binary Trees & AVL',
    shortLine: 'Insert, search, traverse, and balance trees with rotations.',
    icon: <GitFork className="w-5 h-5 text-emerald-400" />,
    accent: 'from-emerald-500/10 to-transparent',
    borderAccent: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    id: 'graphs',
    title: 'Graph Pathfinding',
    shortLine: 'Traverse graphs and find shortest paths with Dijkstra.',
    icon: <Network className="w-5 h-5 text-amber-400" />,
    accent: 'from-amber-500/10 to-transparent',
    borderAccent: 'border-amber-500/30 hover:border-amber-500/60',
  },
  {
    id: 'hashing',
    title: 'Hash Tables',
    shortLine: 'Hash keys, handle collisions, and probe dynamic table buckets.',
    icon: <Hash className="w-5 h-5 text-rose-400" />,
    accent: 'from-rose-500/10 to-transparent',
    borderAccent: 'border-rose-500/30 hover:border-rose-500/60',
  },
];

export const LandingPage: React.FC = () => {
  const { setActiveView, setIsTourOpen } = useAppStore();

  const handleStartDemo = () => {
    setActiveView('sorting');
    setIsTourOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-6xl mx-auto space-y-8 select-none overflow-y-auto w-full">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-400">
            DSA Explorer
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Learn Data Structures & Algorithms Visually
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Build an array, tree or graph, then watch each algorithm run step by step.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-glow transition-all"
              aria-label="Start with a demo"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start with a Demo</span>
            </button>

            <button
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors"
              aria-label="Take a tour"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Take a tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Six Interactive Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleCards.map((card) => (
          <div
            key={card.id}
            className={`flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b ${card.accent} bg-slate-950/60 border ${card.borderAccent} transition-all duration-200`}
          >
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
                {card.icon}
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {card.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  {card.shortLine}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-end">
              <button
                onClick={() => setActiveView(card.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 hover:border-brand-500 transition-all shadow-sm"
                aria-label={`Explore ${card.title}`}
              >
                Explore →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
