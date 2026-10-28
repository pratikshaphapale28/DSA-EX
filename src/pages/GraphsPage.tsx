import React, { useState, useEffect } from 'react';
import { bfsAlgorithm } from '../algorithms/graphs/bfs';
import { dfsAlgorithm } from '../algorithms/graphs/dfs';
import { dijkstraAlgorithm } from '../algorithms/graphs/dijkstra';
import { sampleGraphs } from '../algorithms/graphs/sampleGraphs';
import { serializeEdgeList, parseEdgeList } from '../algorithms/graphs/edgeListParser';
import { GraphVisualizer } from '../components/visualizers/GraphVisualizer';
import { InsightPanel } from '../components/insights/InsightPanel';
import { ColorLegend, type LegendItem } from '../components/common/ColorLegend';
import { Modal } from '../components/common/Modal';
import { usePlayerStore } from '../engine/usePlayerStore';
import type { GraphData, GraphSnapshot, GraphNode } from '../types/graph';
import type { AlgorithmDefinition } from '../types/algorithm';
import {
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const graphLegendItems: LegendItem[] = [
  { label: 'Start', color: 'bg-emerald-500/20', borderColor: 'border-emerald-500', customSymbol: 'S' },
  { label: 'Target', color: 'bg-purple-500/20', borderColor: 'border-purple-500', customSymbol: 'T' },
  { label: 'Exploring', color: 'bg-amber-500/20', borderColor: 'border-amber-500', shape: 'circle' },
  { label: 'Visited', color: 'bg-cyan-500/20', borderColor: 'border-cyan-500', shape: 'square' },
  { label: 'Path', color: 'bg-emerald-500/30', borderColor: 'border-emerald-400', customSymbol: '★', shape: 'badge' },
  { label: 'Unvisited', color: 'bg-slate-800', borderColor: 'border-slate-700', shape: 'dash' },
];

export const GraphsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bfs' | 'dfs' | 'dijkstra'>('bfs');
  const [currentGraph, setCurrentGraph] = useState<GraphData>(sampleGraphs.dijkstraRoadmap.data);
  const [startNodeId, setStartNodeId] = useState<string>('A');
  const [targetNodeId, setTargetNodeId] = useState<string>('D');

  // Text Edge List Modal state
  const [isEdgeListModalOpen, setIsEdgeListModalOpen] = useState(false);
  const [edgeListText, setEdgeListText] = useState('');
  const [edgeListError, setEdgeListError] = useState<string | null>(null);

  const { mode, setSteps, getCurrentStep } = usePlayerStore();
  const [activePresetKey, setActivePresetKey] = useState<string>('dijkstraRoadmap');
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(false);

  const currentStep = getCurrentStep();

  // Active algorithm definition
  let currentAlgorithm: AlgorithmDefinition<any, GraphSnapshot, any>;
  switch (activeTab) {
    case 'dfs':
      currentAlgorithm = dfsAlgorithm;
      break;
    case 'dijkstra':
      currentAlgorithm = dijkstraAlgorithm;
      break;
    case 'bfs':
    default:
      currentAlgorithm = bfsAlgorithm;
      break;
  }

  // Re-generate steps on state change
  useEffect(() => {
    const validStart = currentGraph.nodes.some((n: GraphNode) => n.id === startNodeId)
      ? startNodeId
      : currentGraph.nodes[0]?.id || 'A';

    const validTarget = currentGraph.nodes.some((n: GraphNode) => n.id === targetNodeId)
      ? targetNodeId
      : null;

    const steps = currentAlgorithm.generateSteps({
      graph: currentGraph,
      startNodeId: validStart,
      targetNodeId: validTarget,
    });

    setSteps(steps);
  }, [activeTab, currentGraph, startNodeId, targetNodeId, currentAlgorithm, setSteps]);

  // Tab change handler
  const handleTabChange = (tab: 'bfs' | 'dfs' | 'dijkstra') => {
    setActiveTab(tab);
    if (tab === 'dijkstra' && !currentGraph.isWeighted) {
      setCurrentGraph((g: GraphData) => ({ ...g, isWeighted: true }));
    }
  };

  // Preset loader
  const handleLoadPreset = (presetKey: string) => {
    setActivePresetKey(presetKey);
    const preset = sampleGraphs[presetKey];
    if (preset) {
      setCurrentGraph(preset.data);
      setStartNodeId(preset.defaultStart);
      setTargetNodeId(preset.defaultTarget || '');
    }
  };

  // Open Edge List Modal
  const handleOpenEdgeListModal = () => {
    setEdgeListText(serializeEdgeList(currentGraph));
    setEdgeListError(null);
    setIsEdgeListModalOpen(true);
  };

  // Sync Edge List from Text
  const handleSyncEdgeList = () => {
    try {
      const parsed = parseEdgeList(edgeListText, currentGraph.isDirected, currentGraph.isWeighted);
      if (parsed.nodes.length === 0) {
        setEdgeListError('Please enter at least one node or edge.');
        return;
      }
      setCurrentGraph(parsed);
      setStartNodeId(parsed.nodes[0]?.id || 'A');
      setIsEdgeListModalOpen(false);
    } catch (err: any) {
      setEdgeListError(err.message || 'Error parsing edge list');
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0 h-full overflow-hidden">
      {/* Center Visualization Canvas */}
      <div className="flex-1 flex flex-col p-2.5 sm:p-3 min-w-0 min-h-0 h-full overflow-hidden gap-1.5">
        {/* 1. Algorithm Tabs Row */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/60 px-2 py-1 rounded-xl border border-slate-800 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleTabChange('bfs')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bfs' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              BFS (Breadth-First)
            </button>
            <button
              onClick={() => handleTabChange('dfs')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dfs' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              DFS (Depth-First)
            </button>
            <button
              onClick={() => handleTabChange('dijkstra')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dijkstra' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Dijkstra (Shortest Path)
            </button>
          </div>

          <button
            onClick={handleOpenEdgeListModal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Edge List</span>
          </button>
        </div>

        {/* 2. "About this algorithm" collapsible line (Starts collapsed, expands as popover overlay) */}
        <div className="relative shrink-0">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <button
              onClick={() => setIsAboutExpanded(!isAboutExpanded)}
              className="w-full flex items-center justify-between font-semibold text-slate-300 hover:text-white transition-colors text-left"
              aria-expanded={isAboutExpanded}
            >
              <span className="flex items-center gap-1.5">
                <span>About {currentAlgorithm.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({isAboutExpanded ? 'Click to close popover' : 'Click to read overview'})
                </span>
              </span>
              {isAboutExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              )}
            </button>
          </div>

          {isAboutExpanded && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs text-slate-300 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
                <span className="font-bold text-white">{currentAlgorithm.name}</span>
                <button
                  onClick={() => setIsAboutExpanded(false)}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  ✕ Close
                </button>
              </div>
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

        {/* 3. Single Compact Preset & Node Selectors Row */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800 text-xs shrink-0">
          {/* Presets */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Preset:</span>
            <select
              value={activePresetKey}
              onChange={(e) => handleLoadPreset(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-brand-500 max-w-[200px] sm:max-w-none truncate"
            >
              {Object.entries(sampleGraphs).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start and Target Nodes in same row */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <label htmlFor="start-node" className="text-slate-400 text-[11px]">
                Start:
              </label>
              <select
                id="start-node"
                value={startNodeId}
                onChange={(e) => setStartNodeId(e.target.value)}
                className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-100 font-mono font-bold"
              >
                {currentGraph.nodes.map((n: GraphNode) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'dijkstra' && (
              <div className="flex items-center gap-1">
                <label htmlFor="target-node" className="text-slate-400 text-[11px]">
                  Target:
                </label>
                <select
                  id="target-node"
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                  className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-100 font-mono font-bold"
                >
                  <option value="">All</option>
                  {currentGraph.nodes
                    .filter((n: GraphNode) => n.id !== startNodeId)
                    .map((n: GraphNode) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 4. Graph Visualizer (Toolbar, Canvas with Overlay Legend, and compact ribbons) */}
        <GraphVisualizer
          snapshot={currentStep ? (currentStep.state as GraphSnapshot) : null}
          currentGraph={currentGraph}
          onUpdateGraph={setCurrentGraph}
          onOpenEdgeListModal={handleOpenEdgeListModal}
          algorithmType={activeTab}
          legendItems={graphLegendItems}
          presetKey={activePresetKey}
        />
      </div>

      {/* Right Live Insight Panel */}
      <InsightPanel
        algorithm={currentAlgorithm}
        inputSize={currentGraph.nodes.length}
      />

      {/* Edge List Modal */}
      <Modal
        isOpen={isEdgeListModalOpen}
        onClose={() => setIsEdgeListModalOpen(false)}
        title="Interactive Edge List Editor"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Format: Source Target [Weight]. Example: A B 4
          </p>
          <textarea
            value={edgeListText}
            onChange={(e) => setEdgeListText(e.target.value)}
            rows={8}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
          {edgeListError && (
            <div className="text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
              {edgeListError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEdgeListModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSyncEdgeList}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg shadow-glow"
            >
              Apply Graph
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
