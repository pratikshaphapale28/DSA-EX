import React, { useState, useMemo } from 'react';
import {
  TableProperties,
  Search,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Copy,
  Download,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useAppStore, type AppView } from '../store/useAppStore';

interface CheatSheetEntry {
  name: string;
  category: 'sorting' | 'searching' | 'stack-queue' | 'trees' | 'graphs' | 'hashing';
  categoryLabel: string;
  bestTime: string;
  avgTime: string;
  worstTime: string;
  space: string;
  stable?: boolean;
  whenToUse: string;
  notes: string;
  targetView: AppView;
}

const cheatSheetData: CheatSheetEntry[] = [
  // Sorting (6 algorithms)
  {
    name: 'Bubble Sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    bestTime: 'O(N)',
    avgTime: 'O(N²)',
    worstTime: 'O(N²)',
    space: 'O(1)',
    stable: true,
    whenToUse: 'Educational demos; detecting almost-sorted data in O(N) when using an early-break swapped flag.',
    notes: 'Repeatedly compares adjacent pairs. Early break detects already-sorted input in O(N).',
    targetView: 'sorting',
  },
  {
    name: 'Selection Sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    bestTime: 'O(N²)',
    avgTime: 'O(N²)',
    worstTime: 'O(N²)',
    space: 'O(1)',
    stable: false,
    whenToUse: 'When memory write operations are extremely costly (guarantees at most N swaps total).',
    notes: 'Finds minimum in remaining subarray and swaps. Always performs N(N-1)/2 comparisons.',
    targetView: 'sorting',
  },
  {
    name: 'Insertion Sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    bestTime: 'O(N)',
    avgTime: 'O(N²)',
    worstTime: 'O(N²)',
    space: 'O(1)',
    stable: true,
    whenToUse: 'Small arrays (N ≤ 20), nearly sorted streams, or as base case in hybrid sorts (Timsort).',
    notes: 'Inserts current item into sorted prefix. Highly efficient for small or nearly sorted arrays.',
    targetView: 'sorting',
  },
  {
    name: 'Merge Sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    bestTime: 'O(N log N)',
    avgTime: 'O(N log N)',
    worstTime: 'O(N log N)',
    space: 'O(N)',
    stable: true,
    whenToUse: 'Guaranteed O(N log N) worst-case with stability required; sorting linked lists or external disk files.',
    notes: 'Divide-and-conquer splitting down to singletons then merging sorted halves. Guaranteed O(N log N).',
    targetView: 'sorting',
  },
  {
    name: 'Quick Sort (Lomuto)',
    category: 'sorting',
    categoryLabel: 'Sorting',
    bestTime: 'O(N log N)',
    avgTime: 'O(N log N)',
    worstTime: 'O(N²)',
    space: 'O(log N)',
    stable: false,
    whenToUse: 'General-purpose in-place sorting where low cache misses and fast average performance are key.',
    notes: 'Partitions around a pivot. Worst-case O(N²) occurs on already sorted arrays without randomized pivot.',
    targetView: 'sorting',
  },
  {
    name: 'Heap Sort',
    category: 'sorting',
    categoryLabel: 'Sorting',
    bestTime: 'O(N log N)',
    avgTime: 'O(N log N)',
    worstTime: 'O(N log N)',
    space: 'O(1)',
    stable: false,
    whenToUse: 'Systems requiring strict O(N log N) worst-case with guaranteed O(1) auxiliary space (no recursion stack).',
    notes: 'Builds max-heap in O(N) then repeatedly extracts maximum to the end. In-place O(N log N).',
    targetView: 'sorting',
  },

  // Searching (2 algorithms)
  {
    name: 'Linear Search',
    category: 'searching',
    categoryLabel: 'Searching',
    bestTime: 'O(1)',
    avgTime: 'O(N)',
    worstTime: 'O(N)',
    space: 'O(1)',
    stable: true,
    whenToUse: 'Unsorted arrays, linked lists, or single-pass checks where sorting overhead is unjustified.',
    notes: 'Scans elements sequentially from index 0. Does not require the array to be sorted.',
    targetView: 'searching',
  },
  {
    name: 'Binary Search',
    category: 'searching',
    categoryLabel: 'Searching',
    bestTime: 'O(1)',
    avgTime: 'O(log N)',
    worstTime: 'O(log N)',
    space: 'O(1)',
    stable: true,
    whenToUse: 'Repeated lookups on sorted arrays, monotonic condition bounds, or bisection answer search.',
    notes: 'Halves search space at each mid comparison. Strictly requires sorted input.',
    targetView: 'searching',
  },

  // Stack & Queue (4 algorithms)
  {
    name: 'Stack (Push / Pop / Peek)',
    category: 'stack-queue',
    categoryLabel: 'Stack & Queue',
    bestTime: 'O(1)',
    avgTime: 'O(1)',
    worstTime: 'O(1)',
    space: 'O(N)',
    whenToUse: 'LIFO workflows: undo/redo history, function call tracking, arithmetic expression evaluation.',
    notes: 'LIFO (Last-In, First-Out). Fixed buffer detects overflow and underflow.',
    targetView: 'stack-queue',
  },
  {
    name: 'Queue (Enqueue / Dequeue)',
    category: 'stack-queue',
    categoryLabel: 'Stack & Queue',
    bestTime: 'O(1)',
    avgTime: 'O(1)',
    worstTime: 'O(1)',
    space: 'O(N)',
    whenToUse: 'FIFO workflows: CPU scheduling, printer task queues, asynchronous request rate limiters.',
    notes: 'FIFO (First-In, First-Out). Front element leaves first; rear element enters.',
    targetView: 'stack-queue',
  },
  {
    name: 'Circular Queue (Ring Buffer)',
    category: 'stack-queue',
    categoryLabel: 'Stack & Queue',
    bestTime: 'O(1)',
    avgTime: 'O(1)',
    worstTime: 'O(1)',
    space: 'O(N)',
    whenToUse: 'Continuous data streaming: audio/video buffers, hardware I/O rings with fixed bounded memory.',
    notes: 'Fixed-size memory recycled with modulo wrap-around `(index + 1) % capacity`.',
    targetView: 'stack-queue',
  },
  {
    name: 'Balanced Parentheses Validator',
    category: 'stack-queue',
    categoryLabel: 'Stack & Queue',
    bestTime: 'O(N)',
    avgTime: 'O(N)',
    worstTime: 'O(N)',
    space: 'O(N)',
    whenToUse: 'Compiler parsing, JSON/HTML bracket matching, formula linting in code editors.',
    notes: 'Pushes openers to stack and matches against closers; string is valid if stack empties.',
    targetView: 'stack-queue',
  },

  // Trees (4 algorithms)
  {
    name: 'BST (Search / Insert)',
    category: 'trees',
    categoryLabel: 'Trees',
    bestTime: 'O(1)',
    avgTime: 'O(log N)',
    worstTime: 'O(N)',
    space: 'O(N)',
    whenToUse: 'Dynamic ordered sets with random insertion keys; range lookups and predecessor/successor queries.',
    notes: 'Left child < parent < right child. Skewed degenerate tree degrades to O(N) linked list.',
    targetView: 'trees',
  },
  {
    name: 'BST Delete (3 Cases)',
    category: 'trees',
    categoryLabel: 'Trees',
    bestTime: 'O(1)',
    avgTime: 'O(log N)',
    worstTime: 'O(N)',
    space: 'O(N)',
    whenToUse: 'Node removal maintaining tree invariants: leaf deletion, child bypass, or in-order successor swap.',
    notes: 'Leaf: remove link; 1 child: bypass; 2 children: copy in-order successor value then delete successor.',
    targetView: 'trees',
  },
  {
    name: 'Tree Traversals (In/Pre/Post/Level)',
    category: 'trees',
    categoryLabel: 'Trees',
    bestTime: 'O(N)',
    avgTime: 'O(N)',
    worstTime: 'O(N)',
    space: 'O(N)',
    whenToUse: 'In-order for sorted output; pre-order for cloning/serialization; post-order for cleanup; level-order for BFS.',
    notes: 'Visits every node once. In-order traversal of BST yields strictly sorted sequence.',
    targetView: 'trees',
  },
  {
    name: 'AVL Tree (Rotations & Balancing)',
    category: 'trees',
    categoryLabel: 'Trees',
    bestTime: 'O(1)',
    avgTime: 'O(log N)',
    worstTime: 'O(log N)',
    space: 'O(N)',
    whenToUse: 'Read-heavy databases requiring strict balance guarantees (balance factor ∈ {-1, 0, 1}).',
    notes: 'Strict balance factor in {-1, 0, 1}. LL, RR, LR, RL single/double rotations in O(1) time.',
    targetView: 'trees',
  },

  // Graphs (3 algorithms)
  {
    name: 'Breadth-First Search (BFS)',
    category: 'graphs',
    categoryLabel: 'Graphs',
    bestTime: 'O(1)',
    avgTime: 'O(V + E)',
    worstTime: 'O(V + E)',
    space: 'O(V)',
    whenToUse: 'Shortest path on unweighted graphs, peer network crawling, social network degree of separation.',
    notes: 'Explores radially level-by-level using a FIFO queue. Finds unweighted shortest paths.',
    targetView: 'graphs',
  },
  {
    name: 'Depth-First Search (DFS)',
    category: 'graphs',
    categoryLabel: 'Graphs',
    bestTime: 'O(1)',
    avgTime: 'O(V + E)',
    worstTime: 'O(V + E)',
    space: 'O(V)',
    whenToUse: 'Cycle detection, topological ordering, connected components, solving mazes and constraint puzzles.',
    notes: 'Explores recursively down branch paths before backtracking. Alphabetical neighbor tie-breaking.',
    targetView: 'graphs',
  },
  {
    name: 'Dijkstra (Shortest Path)',
    category: 'graphs',
    categoryLabel: 'Graphs',
    bestTime: 'O(V + E)',
    avgTime: 'O((V + E) log V)',
    worstTime: 'O(V²)',
    space: 'O(V)',
    whenToUse: 'GPS mapping and routing protocols on graphs with strictly non-negative edge weights.',
    notes: 'Greedy shortest path on non-negative weighted graphs via distance relaxation.',
    targetView: 'graphs',
  },

  // Hashing (3 algorithms)
  {
    name: 'Hash Table (Chaining)',
    category: 'hashing',
    categoryLabel: 'Hashing',
    bestTime: 'O(1)',
    avgTime: 'O(1)',
    worstTime: 'O(N)',
    space: 'O(N)',
    whenToUse: 'High collision frequency expected, unpredictable key count, or load factor λ > 0.7.',
    notes: 'Collisions appended to bucket lists. Degrades to O(N) if all keys hash to the same bucket.',
    targetView: 'hashing',
  },
  {
    name: 'Hash Table (Linear Probing)',
    category: 'hashing',
    categoryLabel: 'Hashing',
    bestTime: 'O(1)',
    avgTime: 'O(1)',
    worstTime: 'O(N)',
    space: 'O(N)',
    whenToUse: 'Cache-friendly open addressing in fixed-size arrays where deletions use DEL tombstones.',
    notes: 'Inspects slot (h + i) mod m. Uses DEL tombstones so searches continue past deleted slots.',
    targetView: 'hashing',
  },
  {
    name: 'Hash Table (Quadratic Probing)',
    category: 'hashing',
    categoryLabel: 'Hashing',
    bestTime: 'O(1)',
    avgTime: 'O(1)',
    worstTime: 'O(N)',
    space: 'O(N)',
    whenToUse: 'Minimizing primary clustering in open addressing; requires prime table capacity.',
    notes: 'Inspects slot (h + i²) mod m. Rehashes to next prime above 2m to prevent probe cycles.',
    targetView: 'hashing',
  },
];

type SortColumn = 'name' | 'category' | 'bestTime' | 'avgTime' | 'worstTime' | 'space';
type SortDirection = 'asc' | 'desc';
type StabilityFilter = 'all' | 'stable' | 'unstable';

const getComplexityRank = (c: string): number => {
  const normalized = c.trim();
  if (normalized.includes('O(1)')) return 1;
  if (normalized.includes('O(log N)') || normalized.includes('O(log V)')) return 2;
  if (normalized.includes('O(V + E)')) return 3;
  if (normalized.includes('O(N)') && !normalized.includes('log') && !normalized.includes('²')) return 3.5;
  if (normalized.includes('O(N log N)') || normalized.includes('O((V + E) log V)')) return 4;
  if (normalized.includes('O(V²)') || normalized.includes('O(N²)')) return 5;
  if (normalized.includes('O(2ᴺ)') || normalized.includes('O(2^N)')) return 6;
  return 10;
};

export const CheatSheetPage: React.FC = () => {
  const { setActiveView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stabilityFilter, setStabilityFilter] = useState<StabilityFilter>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'searching', label: 'Searching' },
    { id: 'stack-queue', label: 'Stack & Queue' },
    { id: 'trees', label: 'Trees' },
    { id: 'graphs', label: 'Graphs' },
    { id: 'hashing', label: 'Hashing' },
  ];

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStabilityFilter('all');
    setSortColumn(null);
    setSortDirection('asc');
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return cheatSheetData.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesStability =
        stabilityFilter === 'all' ||
        (stabilityFilter === 'stable' && item.stable === true) ||
        (stabilityFilter === 'unstable' && item.stable === false);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.whenToUse.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.bestTime.toLowerCase().includes(q) ||
        item.avgTime.toLowerCase().includes(q) ||
        item.worstTime.toLowerCase().includes(q) ||
        item.space.toLowerCase().includes(q);

      return matchesCategory && matchesStability && matchesSearch;
    });
  }, [searchQuery, selectedCategory, stabilityFilter]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      let result = 0;
      if (sortColumn === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortColumn === 'category') {
        result = a.categoryLabel.localeCompare(b.categoryLabel);
      } else if (sortColumn === 'bestTime') {
        result = getComplexityRank(a.bestTime) - getComplexityRank(b.bestTime);
      } else if (sortColumn === 'avgTime') {
        result = getComplexityRank(a.avgTime) - getComplexityRank(b.avgTime);
      } else if (sortColumn === 'worstTime') {
        result = getComplexityRank(a.worstTime) - getComplexityRank(b.worstTime);
      } else if (sortColumn === 'space') {
        result = getComplexityRank(a.space) - getComplexityRank(b.space);
      }
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Copy to clipboard as formatted GitHub markdown table
  const handleCopyMarkdown = () => {
    const headers = [
      'Algorithm',
      'Category',
      'Best Time',
      'Average Time',
      'Worst Time',
      'Space',
      'Stability',
      'When to Use',
      'Key Notes',
    ];
    const headerLine = `| ${headers.join(' | ')} |`;
    const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
    const rowLines = sortedData.map((item) => {
      const stabilityStr =
        item.stable === true ? 'Stable' : item.stable === false ? 'Unstable' : 'N/A';
      return `| ${item.name} | ${item.categoryLabel} | ${item.bestTime} | ${item.avgTime} | ${item.worstTime} | ${item.space} | ${stabilityStr} | ${item.whenToUse} | ${item.notes} |`;
    });
    const markdown = [headerLine, separatorLine, ...rowLines].join('\n');

    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2200);
    });
  };

  // Export as CSV
  const handleExportCSV = () => {
    const headers = [
      'Algorithm',
      'Category',
      'Best Time',
      'Average Time',
      'Worst Time',
      'Space',
      'Stability',
      'When to Use',
      'Key Notes',
    ];
    const clean = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rowLines = sortedData.map((item) => {
      const stabilityStr =
        item.stable === true ? 'Stable' : item.stable === false ? 'Unstable' : 'N/A';
      return [
        clean(item.name),
        clean(item.categoryLabel),
        clean(item.bestTime),
        clean(item.avgTime),
        clean(item.worstTime),
        clean(item.space),
        clean(stabilityStr),
        clean(item.whenToUse),
        clean(item.notes),
      ].join(',');
    });
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rowLines].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dsa-complexity-cheat-sheet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Complexity Color Scheme (Strictly Ordered Best to Worst):
   * 1. O(1) -> Emerald (Excellent)
   * 2. O(log N) -> Teal (Great)
   * 3. O(N), O(V + E) -> Sky (Good, linear is faster than N log N!)
   * 4. O(N log N), O((V+E)log V) -> Amber (Fair, linearithmic)
   * 5. O(N²), O(V²) -> Rose (Poor / Bad, quadratic)
   * 6. O(2ᴺ), O(N!) -> Red (Horrible / Worst, exponential)
   */
  const getComplexityBadge = (complexity: string) => {
    if (complexity.includes('O(1)')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (complexity.includes('O(log N)') || complexity.includes('O(log V)')) {
      return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
    }
    if (
      (complexity.includes('O(N)') || complexity.includes('O(V + E)')) &&
      !complexity.includes('log') &&
      !complexity.includes('²')
    ) {
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
    if (complexity.includes('log')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (complexity.includes('²')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return 'bg-red-500/15 text-red-400 border-red-500/30';
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    stabilityFilter !== 'all' ||
    searchQuery.trim().length > 0 ||
    sortColumn !== null;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-6 pb-28 select-none">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
              <TableProperties className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5 flex-wrap">
                <span>Big-O Complexity Cheat Sheet</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Showing {sortedData.length} of {cheatSheetData.length}
                </span>
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-700 transition-colors"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Master asymptotic comparison matrix across all 6 core computer science modules.
              </p>
            </div>
          </div>

          {/* Action Tools: Search, Markdown, Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search algorithm, notes..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-500"
              />
            </div>

            {/* Copy as Markdown Button */}
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 shadow-sm transition-all relative"
              title="Copy filtered cheat sheet as GitHub-Flavored Markdown table"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-brand-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 shadow-sm transition-all"
              title="Export filtered data as CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row: Category Tabs & Stability Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const count =
                cat.id === 'all'
                  ? cheatSheetData.length
                  : cheatSheetData.filter((d) => d.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      selectedCategory === cat.id
                        ? 'bg-brand-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stability Filter */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3 text-brand-400" />
              <span>Stability:</span>
            </span>
            {(
              [
                ['all', 'All'],
                ['stable', 'Stable'],
                ['unstable', 'Unstable'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStabilityFilter(value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  stabilityFilter === value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complexity Reference Growth Scale (Best -> Worst) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
        {/* 1. Excellent: O(1) */}
        <div className="p-2.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Excellent
          </div>
          <div className="font-mono font-bold text-emerald-300 mt-0.5">O(1)</div>
          <div className="text-[10px] text-slate-400">Constant</div>
        </div>

        {/* 2. Great: O(log N) */}
        <div className="p-2.5 rounded-xl bg-teal-950/25 border border-teal-500/30">
          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Great</div>
          <div className="font-mono font-bold text-teal-300 mt-0.5">O(log N)</div>
          <div className="text-[10px] text-slate-400">Logarithmic</div>
        </div>

        {/* 3. Good: O(N) */}
        <div className="p-2.5 rounded-xl bg-sky-950/25 border border-sky-500/30">
          <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Good</div>
          <div className="font-mono font-bold text-sky-300 mt-0.5">O(N)</div>
          <div className="text-[10px] text-slate-400">Linear</div>
        </div>

        {/* 4. Fair: O(N log N) */}
        <div className="p-2.5 rounded-xl bg-amber-950/25 border border-amber-500/30">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Fair</div>
          <div className="font-mono font-bold text-amber-300 mt-0.5">O(N log N)</div>
          <div className="text-[10px] text-slate-400">Linearithmic</div>
        </div>

        {/* 5. Bad: O(N²) */}
        <div className="p-2.5 rounded-xl bg-rose-950/25 border border-rose-500/30">
          <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Bad</div>
          <div className="font-mono font-bold text-rose-300 mt-0.5">O(N²)</div>
          <div className="text-[10px] text-slate-400">Quadratic</div>
        </div>

        {/* 6. Worst: O(2ᴺ) */}
        <div className="p-2.5 rounded-xl bg-red-950/25 border border-red-500/30">
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Worst</div>
          <div className="font-mono font-bold text-red-300 mt-0.5">O(2ᴺ)</div>
          <div className="text-[10px] text-slate-400">Exponential</div>
        </div>
      </div>

      {/* Main Responsive Table Card */}
      <div className="bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl overflow-x-auto">
        {sortedData.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400">
              <Search className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No algorithms match your search</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              We couldn&apos;t find any algorithms matching &ldquo;{searchQuery}&rdquo; with the selected filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-all shadow-glow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
              <tr className="text-slate-400 uppercase tracking-wider text-[10px]">
                {/* Algorithm Name Column */}
                <th className="py-3.5 px-4 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <span>Algorithm / Structure</span>
                    {sortColumn === 'name' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-brand-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-80" />
                    )}
                  </button>
                </th>

                {/* Category Column */}
                <th className="py-3.5 px-3 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <span>Category</span>
                    {sortColumn === 'category' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-brand-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-80" />
                    )}
                  </button>
                </th>

                {/* Best Time Column */}
                <th className="py-3.5 px-3 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  <button
                    onClick={() => handleSort('bestTime')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <span>Best Time</span>
                    {sortColumn === 'bestTime' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-brand-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-80" />
                    )}
                  </button>
                </th>

                {/* Average Time Column */}
                <th className="py-3.5 px-3 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  <button
                    onClick={() => handleSort('avgTime')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <span>Average Time</span>
                    {sortColumn === 'avgTime' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-brand-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-80" />
                    )}
                  </button>
                </th>

                {/* Worst Time Column */}
                <th className="py-3.5 px-3 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  <button
                    onClick={() => handleSort('worstTime')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <span>Worst Time</span>
                    {sortColumn === 'worstTime' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-brand-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-80" />
                    )}
                  </button>
                </th>

                {/* Space Column */}
                <th className="py-3.5 px-3 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  <button
                    onClick={() => handleSort('space')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <span>Space</span>
                    {sortColumn === 'space' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-brand-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-brand-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-80" />
                    )}
                  </button>
                </th>

                {/* When to Use Column */}
                <th className="py-3.5 px-4 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  When to Use
                </th>

                {/* Invariants & Key Notes Column */}
                <th className="py-3.5 px-4 font-bold bg-slate-950/95 backdrop-blur-md sticky top-0">
                  Invariants & Key Notes
                </th>

                {/* Action Link Column */}
                <th className="py-3.5 px-4 font-bold text-right bg-slate-950/95 backdrop-blur-md sticky top-0">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-800/80">
              {sortedData.map((item) => (
                <tr
                  key={item.name}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Name + Stability Tag */}
                  <td className="py-3.5 px-4 font-bold text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.stable !== undefined && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            item.stable
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                          title={item.stable ? 'Stable Algorithm' : 'Unstable Algorithm'}
                        >
                          {item.stable ? 'Stable' : 'Unstable'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-400">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-medium">
                      {item.categoryLabel}
                    </span>
                  </td>

                  {/* Best Time */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${getComplexityBadge(
                        item.bestTime
                      )}`}
                    >
                      {item.bestTime}
                    </span>
                  </td>

                  {/* Average Time */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${getComplexityBadge(
                        item.avgTime
                      )}`}
                    >
                      {item.avgTime}
                    </span>
                  </td>

                  {/* Worst Time */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${getComplexityBadge(
                        item.worstTime
                      )}`}
                    >
                      {item.worstTime}
                    </span>
                  </td>

                  {/* Space */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-violet-950/25 text-violet-300 border border-violet-500/30">
                      {item.space}
                    </span>
                  </td>

                  {/* When to Use */}
                  <td className="py-3.5 px-4 text-emerald-300/90 max-w-xs leading-relaxed text-[11px] font-medium">
                    {item.whenToUse}
                  </td>

                  {/* Invariants & Notes */}
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed text-[11px]">
                    {item.notes}
                  </td>

                  {/* Action Link Button */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setActiveView(item.targetView)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-brand-300 hover:text-white bg-brand-500/10 hover:bg-brand-600 rounded-lg border border-brand-500/30 transition-all shadow-sm"
                      title={`Launch ${item.name} in Visualizer`}
                    >
                      <span>Visualize</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
