import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TreeSnapshot } from '../../types/tree';
import type { LegendItem } from '../common/ColorLegend';
import { AlertCircle, RefreshCw, Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { computeBoundingViewBox } from '../../utils/viewBox';

interface TreeVisualizerProps {
  snapshot: TreeSnapshot | null;
  legendItems?: LegendItem[];
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ snapshot, legendItems }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });

  const fitToView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Recompute fit on container or window resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      fitToView();
    });
    observer.observe(container);

    window.addEventListener('resize', fitToView);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fitToView);
    };
  }, [fitToView]);

  // Mouse wheel zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.85;
      setZoom((z) => {
        const next = Math.min(5, Math.max(0.25, z * factor));
        return Number(next.toFixed(2));
      });
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, []);

  if (!snapshot || !snapshot.rootId || Object.keys(snapshot.nodes).length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-8 min-h-[45vh] bg-slate-900/40 rounded-2xl border border-slate-800">
        <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
        <span>Tree is currently empty. Insert elements to visualize structure.</span>
      </div>
    );
  }

  const {
    treeType,
    rootId,
    nodes,
    highlightedNodeIds = [],
    searchPathNodeIds = [],
    unbalancedNodeId,
    rotationCase,
    rotationReason,
    traversalOutput,
    traversalType,
  } = snapshot;

  const nodeArray = Object.values(nodes);
  const nodePoints = nodeArray
    .filter((n) => typeof n.x === 'number' && typeof n.y === 'number')
    .map((n) => ({ x: n.x!, y: n.y! }));

  const viewBoxResult = computeBoundingViewBox(nodePoints, {
    padding: 40,
    nodeRadius: 30,
    minWidth: 460,
    minHeight: 260,
    zoom,
    panX: pan.x,
    panY: pan.y,
  });

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement;
    if (target.id === 'tree-canvas-bg' || target.tagName === 'svg') {
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanningRef.current) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBoxResult.width / (rect.width || 1);
      const scaleY = viewBoxResult.height / (rect.height || 1);
      const dx = (e.clientX - panStartRef.current.clientX) * scaleX;
      const dy = (e.clientY - panStartRef.current.clientY) * scaleY;
      setPan({
        x: panStartRef.current.panX - dx,
        y: panStartRef.current.panY - dy,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden w-full select-none">
      {/* Unified One-Row Toolbar */}
      <div className="w-full flex items-center justify-between gap-2 px-2 py-1 bg-slate-900/70 border border-slate-800 rounded-xl shrink-0 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          {rotationCase ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40 animate-pulse shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              Rotation: {rotationCase}
            </span>
          ) : unbalancedNodeId ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Unbalanced #{unbalancedNodeId}
            </span>
          ) : (
            <span className="text-xs font-mono text-slate-400 shrink-0">
              Nodes: <strong className="text-slate-200">{nodeArray.length}</strong> | Height: <strong className="text-slate-200">{nodes[rootId]?.height || 1}</strong>
            </span>
          )}

          {rotationReason && (
            <span className="text-[11px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 hidden md:inline truncate max-w-xs">
              {rotationReason}
            </span>
          )}

          {treeType === 'avl' && (
            <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 hidden sm:inline shrink-0">
              BF ∈ [-1, +1]
            </span>
          )}
        </div>

        {/* Zoom & Fit-to-View Controls */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 shadow-sm">
          <button
            onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.15).toFixed(2))))}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1 min-w-[32px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fitToView}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors ml-0.5"
            title="Reset fit to view"
            aria-label="Fit to view"
          >
            <Maximize2 className="w-3 h-3 text-brand-400" />
            <span>Fit to view</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container with auto-fit viewBox and flex-1 */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 min-h-[45vh] w-full relative rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden flex items-center justify-center"
      >
        <svg
          ref={svgRef}
          viewBox={viewBoxResult.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className={`w-full h-full block select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Background rect for panning */}
          <rect
            id="tree-canvas-bg"
            x={viewBoxResult.minX - 5000}
            y={viewBoxResult.minY - 5000}
            width={viewBoxResult.width + 10000}
            height={viewBoxResult.height + 10000}
            className="fill-transparent"
          />
          {/* Edges from parent to children */}
          {nodeArray.map((node) => {
            if (!node.x || !node.y) return null;
            const leftChild = node.leftId ? nodes[node.leftId] : null;
            const rightChild = node.rightId ? nodes[node.rightId] : null;

            return (
              <g key={`edges-${node.id}`}>
                {leftChild && leftChild.x && leftChild.y && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={leftChild.x}
                    y2={leftChild.y}
                    stroke="#475569"
                    strokeWidth="2"
                  />
                )}
                {rightChild && rightChild.x && rightChild.y && (
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={rightChild.x}
                    y2={rightChild.y}
                    stroke="#475569"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}

          {/* Node Circles */}
          {nodeArray.map((node) => {
            if (!node.x || !node.y) return null;
            const isHighlighted = highlightedNodeIds.includes(node.id);
            const inSearchPath = searchPathNodeIds.includes(node.id);
            const isUnbalanced = unbalancedNodeId === node.id;

            let circleFill = 'fill-slate-900';
            let strokeColor = 'stroke-slate-600';
            let strokeWidth = '2';

            if (isUnbalanced) {
              circleFill = 'fill-rose-950';
              strokeColor = 'stroke-rose-400';
              strokeWidth = '3';
            } else if (isHighlighted) {
              circleFill = 'fill-brand-600';
              strokeColor = 'stroke-brand-300';
              strokeWidth = '3';
            } else if (inSearchPath) {
              circleFill = 'fill-amber-950/80';
              strokeColor = 'stroke-amber-400';
              strokeWidth = '2.5';
            }

            // Balance factor display badge style
            const isBfViolated = Math.abs(node.balanceFactor) > 1;

            return (
              <g key={`node-${node.id}`} className="transition-all duration-300">
                {/* Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  className={`${circleFill} ${strokeColor} transition-colors duration-300 filter drop-shadow-md`}
                  strokeWidth={strokeWidth}
                />

                {/* Node Value */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="text-xs font-mono font-bold fill-white select-none"
                >
                  {node.val}
                </text>

                {/* Balance Factor badge on top-right (for AVL) */}
                {treeType === 'avl' && (
                  <g transform={`translate(${node.x + 10}, ${node.y - 18})`}>
                    <rect
                      x={-2}
                      y={-9}
                      width={28}
                      height={13}
                      rx={3}
                      className={
                        isBfViolated
                          ? 'fill-rose-600'
                          : node.balanceFactor === 0
                          ? 'fill-slate-800'
                          : 'fill-cyan-900'
                      }
                    />
                    <text
                      x={12}
                      y={0}
                      textAnchor="middle"
                      className={`text-[8px] font-mono font-bold select-none ${
                        isBfViolated ? 'fill-white' : 'fill-slate-200'
                      }`}
                    >
                      {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                    </text>
                  </g>
                )}

                {/* Height badge on top-left */}
                <g transform={`translate(${node.x - 22}, ${node.y - 18})`}>
                  <rect
                    x={-2}
                    y={-9}
                    width={18}
                    height={13}
                    rx={3}
                    className="fill-slate-800"
                  />
                  <text
                    x={7}
                    y={0}
                    textAnchor="middle"
                    className="text-[8px] font-mono fill-slate-300 select-none"
                  >
                    h{node.height}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Semi-Transparent Legend in Bottom-Left Corner */}
        {legendItems && legendItems.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] shadow-lg pointer-events-auto flex flex-wrap items-center gap-2 max-w-[90%] select-none">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] mr-0.5">
              Legend:
            </span>
            {legendItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full border ${item.color} ${
                    item.borderColor || 'border-slate-600'
                  } flex items-center justify-center text-[7px] font-bold`}
                >
                  {item.customSymbol}
                </span>
                <span className="text-slate-300 font-medium text-[10px]">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Traversal Output Sequence Ribbon */}
      {traversalOutput && traversalOutput.length > 0 && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-400 mb-2 px-2">
            <span className="capitalize">{traversalType} Traversal Live Output Sequence</span>
            <span className="text-[10px] font-mono text-brand-300">
              {traversalOutput.length} node(s) visited
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-16 overflow-y-auto">
            {traversalOutput.map((val, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm animate-in zoom-in-75 duration-150"
              >
                {val}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
