import React, { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useToast } from './context/ToastContext.jsx';
import { useGraph } from './hooks/useGraph.js';
import LandingScreen from './components/LandingScreen.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import SidePanel from './components/SidePanel.jsx';
import Toolbar from './components/Toolbar.jsx';
import AddConceptDialog from './components/AddConceptDialog.jsx';

export default function App() {
  const toast = useToast();

  // ── session state ──────────────────────────────────────────────
  const [course,         setCourse]         = useState(null);
  const [role,           setRole]           = useState(null);   // 'student' | 'educator'
  const [mode,           setMode]           = useState('educator');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [addDialog,      setAddDialog]      = useState({ open: false, position: { x: 0, y: 0 } });

  const courseId = course?.id ?? null;
  const graph    = useGraph(courseId, toast);

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId]
  );

  // ── landing callbacks ──────────────────────────────────────────
  const handleEnter = useCallback((c, r) => {
    setCourse(c);
    setRole(r);
    setMode(r === 'student' ? 'student' : 'educator');
    toast.success(`Opened "${c.title}"`);
  }, [toast]);

  const handleBackToCourses = useCallback(() => {
    setCourse(null);
    setRole(null);
    setSelectedNodeId(null);
  }, []);

  // ── toolbar callbacks ──────────────────────────────────────────
  const handleModeChange = useCallback((next) => setMode(next), []);

  const handleAddConceptFromToolbar = useCallback(() => {
    const jitter = () => Math.round(Math.random() * 160 - 80);
    setAddDialog({ open: true, position: { x: 480 + jitter(), y: 260 + jitter() } });
  }, []);

  // ── canvas callbacks ───────────────────────────────────────────
  const handleNodeClick = useCallback((_e, node) => setSelectedNodeId(node.id), []);
  const handleClosePanel = useCallback(() => setSelectedNodeId(null), []);

  const handleNodeDragStop = useCallback(
    (_e, node) => graph.persistNodePosition(node.id, node.position), [graph]);

  const handleConnect = useCallback(
    (conn) => graph.addEdgeBetween(conn.source, conn.target), [graph]);

  const handleEdgesDelete = useCallback(
    (deleted) => graph.removeEdges(deleted), [graph]);

  const handleNodesDelete = useCallback(
    (deleted) => {
      deleted.forEach((n) => graph.removeConcept(n.id));
      if (deleted.some((n) => n.id === selectedNodeId)) setSelectedNodeId(null);
    }, [graph, selectedNodeId]);

  const handleRequestAddConcept = useCallback((position) => {
    setAddDialog({ open: true, position });
  }, []);

  // ── add concept dialog ─────────────────────────────────────────
  const handleAddSubmit = useCallback(async (formData) => {
    const node = await graph.addConcept(formData, addDialog.position);
    if (node) {
      toast.success(`"${formData.title}" added to the map`);
      setAddDialog({ open: false, position: { x: 0, y: 0 } });
    }
  }, [graph, addDialog.position, toast]);

  const handleAddCancel = useCallback(() =>
    setAddDialog({ open: false, position: { x: 0, y: 0 } }), []);

  // ── mastery / delete ───────────────────────────────────────────
  const handleMasteryChange = useCallback(
    (id, status) => graph.setMastery(id, status), [graph]);

  const handleDeleteConcept = useCallback((id) => {
    const node = graph.nodes.find((n) => n.id === id);
    graph.removeConcept(id);
    setSelectedNodeId(null);
    if (node) toast.info(`"${node.data.title}" removed`);
  }, [graph, toast]);

  // ── render ─────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* animated background field */}
      <div className="bg-field" aria-hidden="true" />

      {/* landing (role + course picker) */}
      {!courseId && <LandingScreen onEnter={handleEnter} />}

      {/* graph view */}
      {courseId && (
        <>
          <Toolbar
            mode={mode}
            role={role}
            course={course}
            onModeChange={handleModeChange}
            onAddConcept={handleAddConceptFromToolbar}
            onBackToCourses={handleBackToCourses}
            saving={graph.saving}
          />

          {graph.loading ? (
            <div className="loading-screen animate-fade-in">
              <div className="spinner" />
              <span className="t-mono" style={{ fontSize: 12, color: 'var(--c-text-3)' }}>
                Loading map…
              </span>
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
