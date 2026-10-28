import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GraphSnapshot, GraphNode, GraphEdge, GraphData } from '../../types/graph';
import type { LegendItem } from '../common/ColorLegend';
import {
  Trash2,
  ArrowRight,
  Minus,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  FileText,
  ListOrdered,
  Layers,
  MousePointer,
  PlusCircle,
  GitCommit,
  Maximize2,
  HelpCircle,
} from 'lucide-react';
import { computeBoundingViewBox } from '../../utils/viewBox';

interface GraphVisualizerProps {
  snapshot: GraphSnapshot | null;
  currentGraph: GraphData;
  onUpdateGraph: (updated: GraphData) => void;
  onOpenEdgeListModal: () => void;
  algorithmType: 'bfs' | 'dfs' | 'dijkstra';
  legendItems?: LegendItem[];
  presetKey?: string;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  snapshot,
  currentGraph,
  onUpdateGraph,
  onOpenEdgeListModal,
  algorithmType,
  legendItems,
  presetKey,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Edge drawing state
  const [edgeSourceNodeId, setEdgeSourceNodeId] = useState<string | null>(null);
  const [edgeDragCurrentPos, setEdgeDragCurrentPos] = useState<{ x: number; y: number } | null>(null);

  // Inline weight editing
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingWeightVal, setEditingWeightVal] = useState<string>('1');

  // Use graph from snapshot if actively stepping, otherwise currentGraph
  const graph = snapshot?.graph || currentGraph;
  const activeNodeId = snapshot?.activeNodeId;
  const activeEdgeId = snapshot?.activeEdgeId;
  const visitedSet = new Set(snapshot?.visitedNodes || []);
  const shortestPathEdges = new Set(snapshot?.shortestPathEdges || []);
  const shortestPathNodes = new Set(snapshot?.shortestPathNodes || []);

  // Editor Tool Mode
  const [editorMode, setEditorMode] = useState<'select' | 'add-node' | 'connect-edge'>('select');
  const [pendingConnectSourceId, setPendingConnectSourceId] = useState<string | null>(null);

  // Pan and Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });

  // Auto-fit function that resets pan & zoom and re-centers view
  const fitToView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Recompute fit on tab change or preset change
  useEffect(() => {
    fitToView();
  }, [algorithmType, presetKey, fitToView]);

  // Recompute fit on canvas container resize (ResizeObserver) and window resize
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

  // Mouse wheel zoom on canvas (prevent default page scroll)
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

  // Auto-fit bounding viewBox computation for graph nodes
  const nodePoints = graph.nodes.map((n) => ({ x: n.x, y: n.y }));
  const nodeRadius = algorithmType === 'dijkstra' ? 34 : 28;
  const viewBoxResult = computeBoundingViewBox(nodePoints, {
    padding: 40,
    nodeRadius,
    minWidth: 460,
    minHeight: 260,
    zoom,
    panX: pan.x,
    panY: pan.y,
  });

  // Accurate SVG point coordinate converter
  const getSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    try {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const transformed = pt.matrixTransform(ctm.inverse());
        return { x: Math.round(transformed.x), y: Math.round(transformed.y) };
      }
    } catch {
      // fallback
    }
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBoxResult.width / (rect.width || 1);
    const scaleY = viewBoxResult.height / (rect.height || 1);
    return {
      x: Math.round(viewBoxResult.minX + (clientX - rect.left) * scaleX),
      y: Math.round(viewBoxResult.minY + (clientY - rect.top) * scaleY),
    };
  };

  // Keyboard Delete / Backspace handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        editingEdgeId !== null
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, currentGraph, editingEdgeId]);

  // Next Node Label generator (A, B, C... Z, A1, B1...)
  const getNextLabel = (): string => {
    const existingLabels = new Set(currentGraph.nodes.map((n) => n.label));
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i);
      if (!existingLabels.has(char)) return char;
    }
    for (let num = 1; num < 100; num++) {
      for (let i = 0; i < 26; i++) {
        const char = `${String.fromCharCode(65 + i)}${num}`;
        if (!existingLabels.has(char)) return char;
      }
    }
    return `N${currentGraph.nodes.length + 1}`;
  };

  // Prevent placing nodes directly on top of existing nodes
  const findNonOverlappingPosition = (startX: number, startY: number, nodes: GraphNode[]) => {
    let x = startX;
    let y = startY;
    const minDistance = 50;
    let hasOverlap = true;
    let attempts = 0;

    while (hasOverlap && attempts < 25) {
      hasOverlap = nodes.some((n) => Math.hypot(n.x - x, n.y - y) < minDistance);
      if (hasOverlap) {
        x += 40;
        y += 35;
        attempts++;
      }
    }
    return { x, y };
  };

  // Delete Node
  const deleteNode = (id: string) => {
    onUpdateGraph({
      ...currentGraph,
      nodes: currentGraph.nodes.filter((n) => n.id !== id),
      edges: currentGraph.edges.filter((e) => e.source !== id && e.target !== id),
    });
    setSelectedNodeId(null);
    fitToView();
  };

  // Delete Edge
  const deleteEdge = (id: string) => {
    onUpdateGraph({
      ...currentGraph,
      edges: currentGraph.edges.filter((e) => e.id !== id),
    });
    setSelectedEdgeId(null);
  };

  // Helper to create edge
  const createEdge = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const existing = currentGraph.edges.find(
      (edge) =>
        (edge.source === sourceId && edge.target === targetId) ||
        (!currentGraph.isDirected && edge.source === targetId && edge.target === sourceId)
    );

    if (!existing) {
      const newEdge: GraphEdge = {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        weight: currentGraph.isWeighted ? 3 : 1,
      };

      onUpdateGraph({
        ...currentGraph,
        edges: [...currentGraph.edges, newEdge],
      });
    }
  };

  // Canvas Mouse Down: Detect Panning vs Click
  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement;
    if (target.id === 'canvas-bg' || target.tagName === 'svg') {
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

  // Node Dragging / Clicking Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();

    // Mode: Connect Edge by clicking source then target
    if (editorMode === 'connect-edge') {
      if (!pendingConnectSourceId) {
        setPendingConnectSourceId(node.id);
      } else if (pendingConnectSourceId === node.id) {
        setPendingConnectSourceId(null);
      } else {
        createEdge(pendingConnectSourceId, node.id);
        setPendingConnectSourceId(null);
      }
      return;
    }

    if (e.shiftKey) {
      // Shift-click/drag shortcut: Initiate edge creation in any mode
      setEdgeSourceNodeId(node.id);
      setEdgeDragCurrentPos({ x: node.x, y: node.y });
      return;
    }

    // Normal drag: Move node
    setDraggingNodeId(node.id);
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeId) {
      const { x: newX, y: newY } = getSvgCoords(e.clientX, e.clientY);

      onUpdateGraph({
        ...currentGraph,
        nodes: currentGraph.nodes.map((n) =>
          n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n
        ),
      });
    } else if (edgeSourceNodeId) {
      setEdgeDragCurrentPos(getSvgCoords(e.clientX, e.clientY));
    } else if (isPanningRef.current) {
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

  // Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      const movedDist = Math.hypot(
        e.clientX - panStartRef.current.clientX,
        e.clientY - panStartRef.current.clientY
      );
      if (movedDist < 5) {
        // It was a click on the canvas background
        if (editorMode === 'add-node') {
          const { x: clickX, y: clickY } = getSvgCoords(e.clientX, e.clientY);
          const { x, y } = findNonOverlappingPosition(clickX, clickY, currentGraph.nodes);
          const label = getNextLabel();
          const newNode: GraphNode = {
            id: label,
            label,
            x,
            y,
          };

          onUpdateGraph({
            ...currentGraph,
            nodes: [...currentGraph.nodes, newNode],
          });

          setSelectedNodeId(newNode.id);
          setSelectedEdgeId(null);
          fitToView();
        } else {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          setPendingConnectSourceId(null);
        }
      }
    }

    if (draggingNodeId) {
      setDraggingNodeId(null);
      fitToView();
    }

    if (edgeSourceNodeId) {
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const targetGroup = targetElement?.closest('[data-node-id]');
      const targetId = targetGroup?.getAttribute('data-node-id');

      if (targetId && targetId !== edgeSourceNodeId) {
        createEdge(edgeSourceNodeId, targetId);
      }

      setEdgeSourceNodeId(null);
      setEdgeDragCurrentPos(null);
    }
  };

  // Toggle Directed
  const toggleDirected = () => {
    onUpdateGraph({
      ...currentGraph,
      isDirected: !currentGraph.isDirected,
    });
  };

  // Toggle Weighted
  const toggleWeighted = () => {
    onUpdateGraph({
      ...currentGraph,
      isWeighted: !currentGraph.isWeighted,
    });
  };

  // Save inline edge weight
  const handleSaveEdgeWeight = (edgeId: string) => {
    const weightNum = Number(editingWeightVal);
    onUpdateGraph({
      ...currentGraph,
      edges: currentGraph.edges.map((e) =>
        e.id === edgeId ? { ...e, weight: isNaN(weightNum) ? 1 : weightNum } : e
      ),
    });
    setEditingEdgeId(null);
  };

  // Find node by id
  const findNode = (id: string) => graph.nodes.find((n) => n.id === id);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden w-full select-none">
      {/* Merged Single Toolbar Row */}
      <div className="w-full flex items-center justify-between gap-1.5 bg-slate-900/70 px-2 py-1 rounded-xl border border-slate-800 shrink-0 text-xs">
        {/* Left: Tool Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 shrink-0">
          <button
            onClick={() => {
              setEditorMode('select');
              setPendingConnectSourceId(null);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
              editorMode === 'select'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Select & move nodes"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>
          <button
            onClick={() => {
              setEditorMode('add-node');
              setPendingConnectSourceId(null);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
              editorMode === 'add-node'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Click canvas to add a new vertex"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
          <button
            onClick={() => {
              setEditorMode('connect-edge');
              setPendingConnectSourceId(null);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
              editorMode === 'connect-edge'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Click source then target to connect edge"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Connect Edge</span>
          </button>
        </div>

        {/* Center: Graph Properties & Actions */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
          {/* Directed / Undirected Toggle */}
          <button
            onClick={toggleDirected}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg transition-colors border ${
              currentGraph.isDirected
                ? 'bg-brand-600/20 text-brand-300 border-brand-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {currentGraph.isDirected ? (
              <>
                <ArrowRight className="w-3 h-3 text-brand-400" />
                <span>Directed</span>
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 text-slate-400" />
                <span>Undirected</span>
              </>
            )}
          </button>

          {/* Weighted / Unweighted Toggle */}
          <button
            onClick={toggleWeighted}
            className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-colors border ${
              currentGraph.isWeighted
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <span>{currentGraph.isWeighted ? 'Weighted' : 'Unweighted'}</span>
          </button>

          {/* Raw Edge List Editor Button */}
          <button
            onClick={onOpenEdgeListModal}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Edit edge list as text"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Edge List</span>
          </button>

          {/* Clear Graph Button */}
          <button
            onClick={() => {
              onUpdateGraph({ ...currentGraph, nodes: [], edges: [] });
              fitToView();
            }}
            className="flex items-center gap-1 px-2 py-0.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Clear all nodes and edges"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right: Selected Element Action, Fit to View, and Mode Hint Tooltip */}
        <div className="flex items-center gap-1 shrink-0">
          {selectedNodeId ? (
            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-300 text-[11px]">
                Node <strong className="text-brand-300">{selectedNodeId}</strong>
              </span>
              <button
                onClick={() => deleteNode(selectedNodeId)}
                className="text-rose-400 hover:text-rose-300 p-0.5"
                title="Delete Node (Del)"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : selectedEdgeId ? (
            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-300 text-[11px]">Edge</span>
              <button
                onClick={() => deleteEdge(selectedEdgeId)}
                className="text-rose-400 hover:text-rose-300 p-0.5"
                title="Delete Edge (Del)"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : null}

          {/* Fit to view button */}
          <button
            onClick={fitToView}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Fit graph to view (reset zoom & pan)"
          >
            <Maximize2 className="w-3 h-3 text-brand-400" />
            <span className="hidden md:inline">Fit to view</span>
          </button>

          {/* Mode Hint Tooltip "?" Icon */}
          <div className="relative group">
            <button
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Tool mode instructions"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-30 w-64 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-[11px] text-slate-300">
              {editorMode === 'select' && (
                <div>
                  <strong className="text-brand-300">Select Mode:</strong> Drag nodes to move them. Click to select (Del to remove). Shift+drag between nodes to connect. Empty space: drag to pan, wheel to zoom.
                </div>
              )}
              {editorMode === 'add-node' && (
                <div>
                  <strong className="text-cyan-300">Add Node Mode:</strong> Click anywhere on empty canvas to place a new vertex. Drag canvas to pan, wheel to zoom.
                </div>
              )}
              {editorMode === 'connect-edge' && (
                <div>
                  <strong className="text-emerald-300">Connect Edge Mode:</strong> Click source node then target node (or drag from source to target) to create an edge.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Negative Weight Alert Banner */}
      {snapshot?.hasNegativeWeight && (
        <div className="w-full bg-rose-950/60 border border-rose-500/50 rounded-xl px-3 py-1.5 flex items-start gap-2.5 text-rose-200 text-xs shrink-0 animate-shake">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 font-bold">Negative Weight Warning: </strong>
            {snapshot.negativeWeightErrorMessage ||
              'Dijkstra does not support negative weights because greedy relaxation assumes edge costs are non-negative.'}
          </div>
        </div>
      )}

      {/* Empty State Banner */}
      {snapshot?.emptyStateMessage && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-amber-300 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{snapshot.emptyStateMessage}</span>
          </div>
        </div>
      )}

      {/* Main Interactive SVG Canvas Container (flex-1, min-height: 45vh) */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 min-h-[45vh] w-full relative rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden flex items-center justify-center"
      >
        <svg
          ref={svgRef}
          viewBox={viewBoxResult.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className={`w-full h-full block select-none ${
            isPanning
              ? 'cursor-grabbing'
              : editorMode === 'add-node'
              ? 'cursor-crosshair'
              : 'cursor-grab'
          }`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <defs>
            {/* Arrowhead marker for directed edges */}
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-500" />
            </marker>
            <marker
              id="graph-arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" className="fill-cyan-400" />
            </marker>
            <marker
              id="graph-arrow-shortest"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" className="fill-emerald-400" />
            </marker>
          </defs>

          {/* Background rect to capture canvas clicks and drag-to-pan */}
          <rect
            id="canvas-bg"
            x={viewBoxResult.minX - 5000}
            y={viewBoxResult.minY - 5000}
            width={viewBoxResult.width + 10000}
            height={viewBoxResult.height + 10000}
            className="fill-transparent"
          />

          {/* Render Graph Edges */}
          {graph.edges.map((edge) => {
            const u = findNode(edge.source);
            const v = findNode(edge.target);
            if (!u || !v) return null;

            const isSelected = selectedEdgeId === edge.id;
            const isActive = activeEdgeId === edge.id;
            const isShortestPath = shortestPathEdges.has(edge.id);

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            let strokeColor = 'stroke-slate-600';
            let strokeWidth = 2;
            let markerEnd = graph.isDirected ? 'url(#graph-arrow)' : undefined;

            if (isShortestPath) {
              strokeColor = 'stroke-emerald-400';
              strokeWidth = 3.5;
              markerEnd = graph.isDirected ? 'url(#graph-arrow-shortest)' : undefined;
            } else if (isActive) {
              strokeColor = 'stroke-cyan-400';
              strokeWidth = 3;
              markerEnd = graph.isDirected ? 'url(#graph-arrow-active)' : undefined;
            } else if (isSelected) {
              strokeColor = 'stroke-brand-400';
              strokeWidth = 2.5;
            }

            return (
              <g
                key={edge.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEdgeId(edge.id);
                  setSelectedNodeId(null);
                }}
              >
                {/* Thick invisible hit area for easy clicking */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="transparent"
                  strokeWidth={18}
                />

                {/* Visible Edge Line */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  className={`${strokeColor} transition-all duration-200`}
                  strokeWidth={strokeWidth}
                  markerEnd={markerEnd}
                />

                {/* Edge Weight Badge (if weighted) */}
                {graph.isWeighted && (
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingEdgeId(edge.id);
                      setEditingWeightVal(String(edge.weight));
                    }}
                  >
                    <rect
                      x={-12}
                      y={-9}
                      width={24}
                      height={18}
                      rx={5}
                      className={
                        edge.weight < 0
                          ? 'fill-rose-700 stroke stroke-rose-400'
                          : isShortestPath
                          ? 'fill-emerald-950 stroke stroke-emerald-500'
                          : 'fill-slate-900 stroke stroke-slate-700 group-hover:border-slate-500'
                      }
                    />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      className={`text-[10px] font-mono font-bold select-none ${
                        edge.weight < 0
                          ? 'fill-rose-100'
                          : isShortestPath
                          ? 'fill-emerald-300'
                          : 'fill-slate-300'
                      }`}
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Edge Creation Drag Preview */}
          {edgeSourceNodeId && edgeDragCurrentPos && (
            <line
              x1={findNode(edgeSourceNodeId)?.x || 0}
              y1={findNode(edgeSourceNodeId)?.y || 0}
              x2={edgeDragCurrentPos.x}
              y2={edgeDragCurrentPos.y}
              className="stroke-cyan-400 stroke-dasharray-4"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}

          {/* Render Graph Nodes */}
          {graph.nodes.map((node) => {
            const isConnectSource = node.id === pendingConnectSourceId;
            const isSelected = selectedNodeId === node.id;
            const isActive = activeNodeId === node.id;
            const isVisited = visitedSet.has(node.id);
            const isShortestPath = shortestPathNodes.has(node.id);
            const isStart = node.id === snapshot?.startNodeId;
            const isTarget = node.id === snapshot?.targetNodeId;

            let circleFill = 'fill-slate-800';
            let circleStroke = 'stroke-slate-600';
            let strokeWidth = 2;

            if (isConnectSource) {
              circleFill = 'fill-emerald-950/90';
              circleStroke = 'stroke-emerald-400';
              strokeWidth = 3.5;
            } else if (isShortestPath) {
              circleFill = 'fill-emerald-900/80';
              circleStroke = 'stroke-emerald-400';
              strokeWidth = 3;
            } else if (isActive) {
              circleFill = 'fill-cyan-900/80';
              circleStroke = 'stroke-cyan-400';
              strokeWidth = 3.5;
            } else if (isVisited) {
              circleFill = 'fill-brand-900/60';
              circleStroke = 'stroke-brand-400';
            } else if (isSelected) {
              circleStroke = 'stroke-amber-400';
              strokeWidth = 3;
            }

            return (
              <g
                key={node.id}
                data-node-id={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-move group"
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                }}
              >
                {/* Active Pulse Ring */}
                {isActive && (
                  <circle
                    r={24}
                    className="fill-none stroke-cyan-400/50 animate-ping"
                    strokeWidth={1.5}
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={18}
                  className={`${circleFill} ${circleStroke} transition-all duration-200`}
                  strokeWidth={strokeWidth}
                />

                {/* Node Label */}
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  className="text-xs font-mono font-bold fill-white select-none pointer-events-none"
                >
                  {node.label}
                </text>

                {/* Start / Target Badges */}
                {isStart && (
                  <g transform="translate(0, -22)">
                    <rect x={-14} y={-7} width={28} height={12} rx={3} className="fill-brand-600" />
                    <text x={0} y={1.5} textAnchor="middle" className="text-[7px] font-mono font-bold fill-white select-none pointer-events-none">
                      START
                    </text>
                  </g>
                )}

                {isTarget && (
                  <g transform="translate(0, 24)">
                    <rect x={-14} y={-7} width={28} height={12} rx={3} className="fill-emerald-600" />
                    <text x={0} y={1.5} textAnchor="middle" className="text-[7px] font-mono font-bold fill-white select-none pointer-events-none">
                      TARGET
                    </text>
                  </g>
                )}

                {/* Dijkstra Distance Badge on Node */}
                {algorithmType === 'dijkstra' && snapshot?.distanceTable?.[node.id] && (
                  <g transform={`translate(0, ${isTarget ? 37 : 24})`}>
                    <rect
                      x={-15}
                      y={-6}
                      width={30}
                      height={12}
                      rx={3}
                      className={
                        snapshot.distanceTable[node.id].status === 'settled'
                          ? 'fill-emerald-950 stroke stroke-emerald-500/60'
                          : snapshot.distanceTable[node.id].status === 'queued'
                          ? 'fill-cyan-950 stroke stroke-cyan-500/60'
                          : 'fill-slate-900 stroke stroke-slate-700'
                      }
                    />
                    <text
                      x={0}
                      y={2}
                      textAnchor="middle"
                      className="text-[7.5px] font-mono font-bold fill-cyan-300 select-none pointer-events-none"
                    >
                      dist:{' '}
                      {snapshot.distanceTable[node.id].distance === Number.POSITIVE_INFINITY
                        ? '∞'
                        : snapshot.distanceTable[node.id].distance}
                    </text>
                  </g>
                )}
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

        {/* Inline Weight Edit Popup */}
        {editingEdgeId && (
          <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl flex items-center gap-2 text-xs z-20">
            <span className="text-slate-300 font-semibold">Weight:</span>
            <input
              type="number"
              value={editingWeightVal}
              onChange={(e) => setEditingWeightVal(e.target.value)}
              className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-slate-100 font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdgeWeight(editingEdgeId);
                if (e.key === 'Escape') setEditingEdgeId(null);
              }}
            />
            <button
              onClick={() => handleSaveEdgeWeight(editingEdgeId)}
              className="px-2 py-1 bg-brand-600 text-white rounded font-bold hover:bg-brand-500"
            >
              Save
            </button>
            <button
              onClick={() => setEditingEdgeId(null)}
              className="px-2 py-1 bg-slate-800 text-slate-400 rounded hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Auxiliary State Viewer Below Canvas (Compact, Shrink-0) */}
      {/* 1. BFS FIFO Queue Ribbon */}
      {algorithmType === 'bfs' && snapshot?.queue && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 flex flex-col gap-1 shrink-0 text-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              FIFO Queue ({snapshot.queue.length} items)
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              Front: <strong className="text-white">{snapshot.queue[0] || 'empty'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto min-h-[32px] p-0.5 bg-slate-950/60 rounded-lg border border-slate-800/80 no-scrollbar">
            {snapshot.queue.length === 0 ? (
              <span className="text-slate-500 text-xs italic px-2">Queue is currently empty</span>
            ) : (
              snapshot.queue.map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-bold rounded border shadow-sm ${
                      idx === 0
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {item}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. DFS LIFO Stack Ribbon */}
      {algorithmType === 'dfs' && snapshot?.stack && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 flex flex-col gap-1 shrink-0 text-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              LIFO Call Stack ({snapshot.stack.length} items)
            </span>
            <span className="text-[11px] font-mono text-amber-300">
              Top: <strong className="text-white">{snapshot.stack[snapshot.stack.length - 1] || 'empty'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto min-h-[32px] p-0.5 bg-slate-950/60 rounded-lg border border-slate-800/80 no-scrollbar">
            {snapshot.stack.length === 0 ? (
              <span className="text-slate-500 text-xs italic px-2">Call stack is empty</span>
            ) : (
              snapshot.stack.map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-bold rounded border shadow-sm ${
                      idx === snapshot.stack!.length - 1
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {item}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Dijkstra Live Distance Table & Priority Queue */}
      {algorithmType === 'dijkstra' && snapshot?.distanceTable && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 flex flex-col gap-1.5 shrink-0 text-xs">
          {/* Relaxation Highlight Banner */}
          {snapshot.relaxationDetail && (
            <div
              className={`px-2 py-0.5 rounded text-[11px] font-mono border flex items-center justify-between ${
                snapshot.relaxationDetail.relaxed
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span>
                Edge {snapshot.relaxationDetail.u} → {snapshot.relaxationDetail.v} (w={snapshot.relaxationDetail.edgeWeight})
              </span>
              <span>
                {snapshot.relaxationDetail.relaxed ? (
                  <strong className="text-emerald-400 font-bold">
                    RELAXED: {snapshot.relaxationDetail.oldDist === Number.POSITIVE_INFINITY ? '∞' : snapshot.relaxationDetail.oldDist} → {snapshot.relaxationDetail.newDist}
                  </strong>
                ) : (
                  <span>No relaxation ({snapshot.relaxationDetail.oldDist} is better)</span>
                )}
              </span>
            </div>
          )}

          {/* Priority Queue Badges */}
          {snapshot.priorityQueue && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-slate-400 font-semibold shrink-0">Priority Queue:</span>
              {snapshot.priorityQueue.length === 0 ? (
                <span className="text-slate-500 italic">Empty</span>
              ) : (
                snapshot.priorityQueue.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 font-mono text-[10px] rounded bg-slate-800 text-cyan-300 border border-slate-700 shrink-0"
                  >
                    {item.nodeId}: {item.distance}
                  </span>
                ))
              )}
            </div>
          )}

          {/* Distance Table */}
          <div className="overflow-x-auto max-h-24 overflow-y-auto">
            <table className="w-full text-left text-[11px] font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-1 font-semibold">Node</th>
                  <th className="pb-1 font-semibold">Distance</th>
                  <th className="pb-1 font-semibold">Previous (Via)</th>
                  <th className="pb-1 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.values(snapshot.distanceTable).map((row) => (
                  <tr
                    key={row.nodeId}
                    className={
                      row.status === 'settled'
                        ? 'bg-emerald-950/20 text-emerald-300'
                        : row.status === 'queued'
                        ? 'bg-cyan-950/20 text-cyan-300'
                        : 'text-slate-400'
                    }
                  >
                    <td className="py-0.5 font-bold">{row.nodeId}</td>
                    <td className="py-0.5">
                      {row.distance === Number.POSITIVE_INFINITY ? '∞' : row.distance}
                    </td>
                    <td className="py-0.5">{row.previousNodeId || '-'}</td>
                    <td className="py-0.5">
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold ${
                          row.status === 'settled'
                            ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-500/40'
                            : row.status === 'queued'
                            ? 'bg-cyan-900/60 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Traversal Order Output Ribbon */}
      {snapshot?.traversalOrder && snapshot.traversalOrder.length > 0 && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
            <ListOrdered className="w-3.5 h-3.5 text-brand-400" />
            Traversal Order:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {snapshot.traversalOrder.map((nodeId, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40 font-mono font-bold text-xs"
              >
                {nodeId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
