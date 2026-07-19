import React, { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useGraph } from './hooks/useGraph.js';
import { DEFAULT_COURSE } from './api/api.js';
import GraphCanvas from './components/GraphCanvas.jsx';
import SidePanel from './components/SidePanel.jsx';
import Toolbar from './components/Toolbar.jsx';
import AddConceptDialog from './components/AddConceptDialog.jsx';
import CoursePicker from './components/CoursePicker.jsx';
import './App.css';

export default function App() {
  // courseId drives the graph — null means "show course picker"
  const [course,         setCourse]         = useState(null);
  const [mode,           setMode]           = useState('educator');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [addDialog,      setAddDialog]      = useState({ open: false, position: { x: 0, y: 0 } });

  const courseId = course?.id ?? null;
  const graph    = useGraph(courseId);

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedNodeId) || null,
    [graph.nodes, selectedNodeId]
  );

  // ── event handlers ────────────────────────────────────────────────────────

  const handleCourseSelect = useCallback((c) => setCourse(c), []);

  const handleBackToCourses = useCallback(() => {
    setCourse(null);
    setSelectedNodeId(null);
  }, []);

  const handleModeChange  = useCallback((next) => setMode(next), []);
  const handleNodeClick   = useCallback((_e, node) => setSelectedNodeId(node.id), []);
  const handleClosePanel  = useCallback(() => setSelectedNodeId(null), []);

  const handleNodeDragStop = useCallback(
    (_e, node) => graph.persistNodePosition(node.id, node.position),
    [graph]
  );

  const handleConnect    = useCallback((conn) => graph.addEdgeBetween(conn.source, conn.target), [graph]);
  const handleEdgesDelete = useCallback((del) => graph.removeEdges(del), [graph]);

  const handleNodesDelete = useCallback(
    (deleted) => {
      deleted.forEach((n) => graph.removeConcept(n.id));
      if (deleted.some((n) => n.id === selectedNodeId)) setSelectedNodeId(null);
    },
    [graph, selectedNodeId]
  );

  const handleRequestAddConcept = useCallback((position) => {
    setAddDialog({ open: true, position });
  }, []);

  const handleAddConceptFromToolbar = useCallback(() => {
    const jitter = () => Math.round(Math.random() * 160 - 80);
    setAddDialog({ open: true, position: { x: 480 + jitter(), y: 260 + jitter() } });
  }, []);

  const handleAddSubmit = useCallback(
    async (formData) => {
      await graph.addConcept(formData, addDialog.position);
      setAddDialog({ open: false, position: { x: 0, y: 0 } });
    },
    [graph, addDialog.position]
  );

  const handleAddCancel = useCallback(() => {
    setAddDialog({ open: false, position: { x: 0, y: 0 } });
  }, []);

  const handleMasteryChange = useCallback(
    (id, status) => graph.setMastery(id, status),
    [graph]
  );

  const handleDeleteConcept = useCallback(
    (id) => {
      graph.removeConcept(id);
      setSelectedNodeId(null);
    },
    [graph]
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="app-shell">
      <div className="contour-field" />
      <div className="contour-vignette" />

      {/* Course picker — shown until a course is selected */}
      {!courseId && <CoursePicker onSelect={handleCourseSelect} />}

      {/* Graph view — mounted only when a course is active */}
      {courseId && (
        <>
          <Toolbar
            mode={mode}
            course={course}
            onModeChange={handleModeChange}
            onAddConcept={handleAddConceptFromToolbar}
            onBackToCourses={handleBackToCourses}
            saving={graph.saving}
            error={graph.error}
            onDismissError={graph.dismissError}
          />

          {graph.loading ? (
            <div className="app-loading">
              <div className="app-loading-spinner" />
              <div className="font-mono app-loading-text">Charting the map…</div>
            </div>
          ) : (
            <ReactFlowProvider>
              <GraphCanvas
                nodes={graph.nodes}
                edges={graph.edges}
                mode={mode}
                onNodesChange={graph.onNodesChange}
                onEdgesChange={graph.onEdgesChange}
                onNodeClick={handleNodeClick}
                onNodeDragStop={handleNodeDragStop}
                onConnect={handleConnect}
                onEdgesDelete={handleEdgesDelete}
                onNodesDelete={handleNodesDelete}
                onRequestAddConcept={handleRequestAddConcept}
              />
            </ReactFlowProvider>
          )}

          <SidePanel
            node={selectedNode}
            mode={mode}
            onClose={handleClosePanel}
            onMasteryChange={handleMasteryChange}
            onDelete={handleDeleteConcept}
          />

          <AddConceptDialog
            open={addDialog.open}
            onCancel={handleAddCancel}
            onSubmit={handleAddSubmit}
            submitting={graph.saving}
          />
        </>
      )}
    </div>
  );
}
