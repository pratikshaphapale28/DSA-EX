import React from 'react';

interface HeapNode {
  val: number;
  index: number;
}

interface HeapTreeVisualizerProps {
  heapTree: HeapNode[];
  heapSize?: number;
  highlightedIndices?: number[];
  secondaryIndices?: number[];
}

export const HeapTreeVisualizer: React.FC<HeapTreeVisualizerProps> = ({
  heapTree,
  heapSize = heapTree.length,
  highlightedIndices = [],
}) => {
  if (heapTree.length === 0) return null;

  // Node coordinates for up to 15 nodes (4 levels)
  const nodeCoords = [
    { x: 160, y: 30 },  // Root (0)
    { x: 90, y: 80 },   // Level 1: 1
    { x: 230, y: 80 },  // Level 1: 2
    { x: 55, y: 130 },  // Level 2: 3
    { x: 125, y: 130 }, // Level 2: 4
    { x: 195, y: 130 }, // Level 2: 5
    { x: 265, y: 130 }, // Level 2: 6
    { x: 38, y: 175 },  // Level 3: 7
    { x: 72, y: 175 },  // Level 3: 8
    { x: 108, y: 175 }, // Level 3: 9
    { x: 142, y: 175 }, // Level 3: 10
    { x: 178, y: 175 }, // Level 3: 11
    { x: 212, y: 175 }, // Level 3: 12
    { x: 248, y: 175 }, // Level 3: 13
    { x: 282, y: 175 }, // Level 3: 14
  ];

  const maxDisplayNodes = Math.min(heapTree.length, nodeCoords.length);

  return (
    <div className="w-full bg-slate-950/60 rounded-xl border border-slate-800 p-3 flex flex-col items-center">
      <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between w-full px-2">
        <span>Binary Heap Tree View (Array to Tree Mapping)</span>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
          Active Heap Size: {heapSize}
        </span>
      </div>

      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid meet"
        className="w-full max-w-sm h-44 overflow-visible"
      >
        {/* Draw edges between parent and children */}
        {Array.from({ length: maxDisplayNodes }).map((_, idx) => {
          if (idx >= heapSize) return null;
          const leftChild = 2 * idx + 1;
          const rightChild = 2 * idx + 2;

          return (
            <g key={`edges-${idx}`}>
              {leftChild < heapSize && leftChild < nodeCoords.length && (
                <line
                  x1={nodeCoords[idx].x}
                  y1={nodeCoords[idx].y}
                  x2={nodeCoords[leftChild].x}
                  y2={nodeCoords[leftChild].y}
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="none"
                />
              )}
              {rightChild < heapSize && rightChild < nodeCoords.length && (
                <line
                  x1={nodeCoords[idx].x}
                  y1={nodeCoords[idx].y}
                  x2={nodeCoords[rightChild].x}
                  y2={nodeCoords[rightChild].y}
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="none"
                />
              )}
            </g>
          );
        })}

        {/* Draw nodes */}
        {heapTree.slice(0, maxDisplayNodes).map((node) => {
          const inHeap = node.index < heapSize;
          const isHighlighted = highlightedIndices.includes(node.index);
          const coords = nodeCoords[node.index];
          if (!coords) return null;

          return (
            <g key={`node-${node.index}`} className="transition-all duration-300">
              <circle
                cx={coords.x}
                cy={coords.y}
                r={16}
                className={`transition-colors duration-300 ${
                  !inHeap
                    ? 'fill-slate-800/40 stroke-slate-700'
                    : isHighlighted
                    ? 'fill-brand-600 stroke-brand-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(67,124,255,0.8)]'
                    : 'fill-slate-900 stroke-slate-600 stroke-2'
                }`}
              />
              <text
                x={coords.x}
                y={coords.y + 4}
                textAnchor="middle"
                className={`text-xs font-mono font-bold select-none ${
                  !inHeap ? 'fill-slate-500' : isHighlighted ? 'fill-white' : 'fill-slate-200'
                }`}
              >
                {node.val}
              </text>
              <text
                x={coords.x}
                y={coords.y - 19}
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-400 select-none"
              >
                [{node.index}]
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
