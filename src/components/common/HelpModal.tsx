import React from 'react';
import { Modal } from './Modal';
import { useAppStore } from '../../store/useAppStore';
import { Keyboard, Sparkles, BookOpen, Clock } from 'lucide-react';

interface ModuleExploration {
  title: string;
  whatIs: string;
  analogy: string;
}

const moduleExplorations: Record<string, ModuleExploration> = {
  sorting: {
    title: 'Sorting Algorithms',
    whatIs: 'Sorting rearranges an unordered list into ascending order. Algorithms vary from simple O(N²) comparison sorts (Bubble, Selection, Insertion) to optimal O(N log N) divide-and-conquer methods (Merge, Quick, Heap).',
    analogy: 'Organizing a hand of playing cards in rank order, or alphabetizing books on a library shelf.',
  },
  searching: {
    title: 'Searching Algorithms',
    whatIs: 'Searching locates a target key within an array or confirms its absence. Linear Search scans sequentially in O(N), while Binary Search divides a sorted array in half at each step to achieve O(log N) lookup.',
    analogy: 'Looking up a surname in a telephone directory by opening to the middle (Binary Search) vs scanning page by page from the start (Linear Search).',
  },
  'stack-queue': {
    title: 'Stacks, Queues & Ring Buffers',
    whatIs: 'Fundamental linear collections with restricted access: Stacks follow LIFO (Last-In, First-Out), Queues follow FIFO (First-In, First-Out), and Circular Queues recycle fixed memory with modulo wrap-around.',
    analogy: 'A spring-loaded stack of cafeteria trays (Stack: top plate taken first) vs passengers in a ticket booth queue (Queue: first arrival served first).',
  },
  trees: {
    title: 'Binary Search Trees & AVL Rotations',
    whatIs: 'Hierarchical node structures where every left descendant is smaller and right descendant is larger. AVL trees self-balance via LL, RR, LR, and RL rotations whenever subtree heights differ by more than 1.',
    analogy: 'A corporate organizational chart or family genealogy tree: queries descend efficiently through binary decisions.',
  },
  graphs: {
    title: 'Graph Traversal & Shortest Path',
    whatIs: 'Non-linear collections of vertices connected by edges. BFS explores radial frontiers; DFS explores deep recursive branches; Dijkstra greedily finds shortest paths via distance table edge relaxation.',
    analogy: 'GPS satellite navigation calculating the least-cost driving route through road networks, or social network friend connections.',
  },
  hashing: {
    title: 'Hash Tables & Collision Resolution',
    whatIs: 'Hash tables map arbitrary keys to array slots in O(1) expected time. Collisions are handled via linked bucket lists (chaining) or open addressing (linear/quadratic probing with tombstones).',
    analogy: 'A coat-check room with numbered wall hooks: tickets map coats directly to numbered pegs with overflow hooks for shared slots.',
  },
};

export const HelpModal: React.FC = () => {
  const { isHelpModalOpen, setIsHelpModalOpen, activeView } = useAppStore();

  const currentModule = moduleExplorations[activeView];

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause algorithm execution' },
    { key: '→ / ↓', desc: 'Step forward one single operation' },
    { key: '← / ↑', desc: 'Step backward (time-travel to previous snapshot)' },
    { key: 'R', desc: 'Reset algorithm to the beginning' },
  ];

  return (
    <Modal
      isOpen={isHelpModalOpen}
      onClose={() => setIsHelpModalOpen(false)}
      title="Quick Guide & Keyboard Shortcuts"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Active Module Explainer & Real-World Analogy */}
        {currentModule && (
          <div className="p-3.5 rounded-2xl bg-brand-950/30 border border-brand-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-300">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>What is {currentModule.title}?</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {currentModule.whatIs}
            </p>
            <div className="pt-2 border-t border-brand-500/20 text-xs text-brand-200/90 leading-relaxed">
              <strong className="text-amber-300 font-semibold">Real-World Analogy: </strong>
              {currentModule.analogy}
            </div>
          </div>
        )}

        {/* Big-O Complexity Explanation */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>Understanding Big-O Complexity</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Big-O measures how operations grow as the dataset size (N) scales, rather than wall-clock seconds. Best case is the lower bound (Ω), average case is typical performance (Θ), and worst case is the theoretical upper bound (O).
          </p>
        </div>

        {/* Keyboard Shortcuts */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-2">
            <Keyboard className="w-4 h-4 text-brand-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800"
              >
                <span className="text-xs text-slate-300">{s.desc}</span>
                <kbd className="px-2 py-0.5 text-xs font-mono font-bold text-slate-200 bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Beginner vs Advanced Mode */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Beginner vs Advanced Modes</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <strong className="text-brand-300">Beginner Mode:</strong> Shows conversational narration with a "Why?" explanation link and expanded real-world analogies.<br />
            <strong className="text-violet-300">Advanced Mode:</strong> Streamlines narration to concise one-liners and focuses on pseudocode lines and operations.
          </p>
        </div>
      </div>
    </Modal>
  );
};
