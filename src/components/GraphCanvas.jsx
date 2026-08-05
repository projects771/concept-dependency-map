import React, { useCallback, useRef } from 'react';
import ReactFlow, { Controls, MiniMap, SelectionMode, useReactFlow } from 'reactflow';
import ConceptNode from './ConceptNode.jsx';
import TrailEdge from './TrailEdge.jsx';
import './GraphCanvas.css';

const nodeTypes = { concept: ConceptNode };
const edgeTypes = { trail: TrailEdge };

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
}) {
  const wrapperRef = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const isEducator = role === 'educator';

  const handlePaneDoubleClick = useCallback((event) => {
    if (!isEducator || !onRequestAddConcept) return;
    if (event.target.closest?.('.react-flow__node')) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    onRequestAddConcept(position);
  }, [isEducator, onRequestAddConcept, screenToFlowPosition]);

  return (
    <div className="gc-wrapper" ref={wrapperRef} onDoubleClick={handlePaneDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'trail' }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
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
