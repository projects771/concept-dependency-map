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

  // ── session ──────────────────────────────────────────────────
  // role is chosen once at the landing screen and NEVER changes
  // during the session. There is no in-app toggle.
  const [course,         setCourse]         = useState(null);
  const [role,           setRole]           = useState(null);   // 'educator' | 'student'
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [addDialog,      setAddDialog]      = useState({ open: false, position: { x: 0, y: 0 } });

  const courseId   = course?.id ?? null;
  const isEducator = role === 'educator';
  const graph      = useGraph(courseId, toast);

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId]
  );

  // ── landing ───────────────────────────────────────────────────
  const handleEnter = useCallback((c, r) => {
    setCourse(c);
    setRole(r);
    toast.success(`Opened "${c.title}" as ${r}`);
  }, [toast]);

  const handleBackToCourses = useCallback(() => {
    setCourse(null);
    setRole(null);
    setSelectedNodeId(null);
  }, []);

  // ── educator: add concept ──────────────────────────────────────
  const handleAddConceptFromToolbar = useCallback(() => {
    const jitter = () => Math.round(Math.random() * 160 - 80);
    setAddDialog({ open: true, position: { x: 480 + jitter(), y: 260 + jitter() } });
  }, []);

  const handleRequestAddConcept = useCallback((position) => {
    setAddDialog({ open: true, position });
  }, []);

  const handleAddSubmit = useCallback(async (formData) => {
    const node = await graph.addConcept(formData, addDialog.position);
    if (node) {
      toast.success(`"${formData.title}" added`);
      setAddDialog({ open: false, position: { x: 0, y: 0 } });
    }
  }, [graph, addDialog.position, toast]);

  const handleAddCancel = useCallback(() =>
    setAddDialog({ open: false, position: { x: 0, y: 0 } }), []);

  // ── canvas ─────────────────────────────────────────────────────
  const handleNodeClick   = useCallback((_e, node) => setSelectedNodeId(node.id), []);
  const handleClosePanel  = useCallback(() => setSelectedNodeId(null), []);
  const handleNodeDragStop = useCallback((_e, node) =>
    graph.persistNodePosition(node.id, node.position), [graph]);
  const handleConnect     = useCallback((conn) =>
    graph.addEdgeBetween(conn.source, conn.target), [graph]);
  const handleEdgesDelete = useCallback((del) =>
    graph.removeEdges(del), [graph]);
  const handleNodesDelete = useCallback((deleted) => {
    deleted.forEach((n) => graph.removeConcept(n.id));
    if (deleted.some((n) => n.id === selectedNodeId)) setSelectedNodeId(null);
  }, [graph, selectedNodeId]);

  // ── mastery (students only) ────────────────────────────────────
  const handleMasteryChange = useCallback(
    (id, status) => graph.setMastery(id, status), [graph]);

  // ── educator: delete ───────────────────────────────────────────
  const handleDeleteConcept = useCallback((id) => {
    const node = graph.nodes.find((n) => n.id === id);
    graph.removeConcept(id);
    setSelectedNodeId(null);
    if (node) toast.info(`"${node.data.title}" removed`);
  }, [graph, toast]);

  // ── render ─────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <div className="bg-field" aria-hidden="true" />

      {/* Landing screen — role is chosen here and locked for the session */}
      {!courseId && <LandingScreen onEnter={handleEnter} />}

      {/* Graph view — only mounted after a course + role are selected */}
      {courseId && (
        <>
          <Toolbar
            role={role}
            course={course}
            onAddConcept={isEducator ? handleAddConceptFromToolbar : undefined}
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
                role={role}
                onNodesChange={graph.onNodesChange}
                onEdgesChange={graph.onEdgesChange}
                onNodeClick={handleNodeClick}
                onNodeDragStop={handleNodeDragStop}
                onConnect={isEducator ? handleConnect : undefined}
                onEdgesDelete={isEducator ? handleEdgesDelete : undefined}
                onNodesDelete={isEducator ? handleNodesDelete : undefined}
                onRequestAddConcept={isEducator ? handleRequestAddConcept : undefined}
              />
            </ReactFlowProvider>
          )}

          {/* SidePanel gets role, not mode — shows different content per role */}
          <SidePanel
            node={selectedNode}
            role={role}
            onClose={handleClosePanel}
            onMasteryChange={!isEducator ? handleMasteryChange : undefined}
            onDelete={isEducator ? handleDeleteConcept : undefined}
          />

          {/* Add dialog — educator only */}
          {isEducator && (
            <AddConceptDialog
              open={addDialog.open}
              onCancel={handleAddCancel}
              onSubmit={handleAddSubmit}
              submitting={graph.saving}
            />
          )}
        </>
      )}
    </div>
  );
}
