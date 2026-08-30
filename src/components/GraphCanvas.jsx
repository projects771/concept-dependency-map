import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, { Controls, MiniMap, SelectionMode, useReactFlow, MarkerType } from 'reactflow';
import ConceptNode from './ConceptNode.jsx';
import DeletableEdge from './DeletableEdge.jsx';
import GraphAmbientBackground from './GraphAmbientBackground.jsx';
import './GraphCanvas.css';

const nodeTypes = { concept: ConceptNode };
const edgeTypes = { deletable: DeletableEdge };

const MASTERY_COLOR = {
  confident:  '#34d399',
  learning:   '#fbbf24',
  struggling: '#f87171',
};

export default function GraphCanvas({
  nodes, edges, role,
  onNodesChange, onEdgesChange,
  onNodeClick, onNodeDragStop,
  onConnect, onEdgesDelete, onNodesDelete,
  onRequestAddConcept,
  selectedNodeId,
}) {
  const wrapperRef = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const isEducator = role === 'educator';
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const focusNodeId = selectedNodeId || hoveredNodeId;

  // When a node is selected (or, absent a selection, hovered), work out which
  // other nodes/edges are directly connected to it so we can dim everything
  // else and highlight the dependency relationships — makes the graph's
  // structure legible at a glance.
  const connected = useMemo(() => {
    if (!focusNodeId) return null;
    const nodeIds = new Set([focusNodeId]);
    const edgeIds = new Set();
    edges.forEach((e) => {
      if (e.source === focusNodeId || e.target === focusNodeId) {
        edgeIds.add(e.id);
        nodeIds.add(e.source);
        nodeIds.add(e.target);
      }
    });
    return { nodeIds, edgeIds };
  }, [focusNodeId, edges]);

  const displayNodes = useMemo(() => {
    if (!connected) return nodes;
    return nodes.map((n) => {
      const extra = n.id === focusNodeId
        ? 'cn-focus'
        : connected.nodeIds.has(n.id) ? 'cn-connected' : 'cn-dimmed';
      return { ...n, className: [n.className, extra].filter(Boolean).join(' ') };
    });
  }, [nodes, connected, focusNodeId]);

  const displayEdges = useMemo(() => {
    if (!connected) return edges;
    return edges.map((e) => {
      const isRelated = connected.edgeIds.has(e.id);
      return {
        ...e,
        className: [e.className, isRelated ? 'edge-highlighted' : 'edge-dimmed'].filter(Boolean).join(' '),
        animated: isRelated ? true : e.animated,
      };
    });
  }, [edges, connected]);

  const handlePaneDoubleClick = useCallback((event) => {
    if (!isEducator || !onRequestAddConcept) return;
    if (event.target.closest?.('.react-flow__node')) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    onRequestAddConcept(position);
  }, [isEducator, onRequestAddConcept, screenToFlowPosition]);

  const handleNodeMouseEnter = useCallback((_e, node) => setHoveredNodeId(node.id), []);
  const handleNodeMouseLeave = useCallback(() => setHoveredNodeId(null), []);

  const defaultEdgeOptions = {
    type: isEducator ? 'deletable' : 'smoothstep',
    animated: false,
    style: { stroke: 'rgba(108,99,255,0.6)', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(108,99,255,0.6)',
      width: 16,
      height: 16,
    },
  };

  return (
    <div className={`gc-wrapper ${!isEducator ? 'student-mode' : ''}`} ref={wrapperRef} onDoubleClick={handlePaneDoubleClick}>
      <GraphAmbientBackground />
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        nodesDraggable={isEducator}
        nodesConnectable={isEducator}
        elementsSelectable
        deleteKeyCode={isEducator ? ['Backspace', 'Delete'] : []}
        selectionMode={SelectionMode.Partial}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={1.8}
        fitView
        fitViewOptions={{ padding: 0.15 }}
      >
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => MASTERY_COLOR[n.data?.mastery] ?? '#5a5a68'}
          maskColor="rgba(10,10,11,0.75)"
        />
      </ReactFlow>

      {/* empty-state hint for new educator maps */}
      {isEducator && nodes.length === 0 && (
        <div className="gc-hint">
          Double-click anywhere to add your first concept
        </div>
      )}
    </div>
  );
}
