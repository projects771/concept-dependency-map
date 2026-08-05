import React, { useCallback, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useToast } from './context/ToastContext.jsx';
import { useRole } from './context/RoleContext.jsx';
import { useGraph } from './hooks/useGraph.js';
import LandingScreen from './components/LandingScreen.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import SidePanel from './components/SidePanel.jsx';
import Toolbar from './components/Toolbar.jsx';
import AddConceptDialog from './components/AddConceptDialog.jsx';

export default function App() {
  const toast          = useToast();
  const { setRole: setCtxRole } = useRole();

  const [course,         setCourse]         = useState(null);
  const [role,           setRole]           = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [addDialog,      setAddDialog]      = useState({ open: false, position: { x: 0, y: 0 } });

  const courseId   = course?.id ?? null;
  const isEducator = role === 'educator';
  const graph      = useGraph(courseId, toast);

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId]
  );

  const handleEnter = useCallback((c, r) => {
    setCourse(c);
    setRole(r);
    setCtxRole(r);   // ← sync to context so ConceptNode can read it
    toast.success(`Opened "${c.title}"`);
  }, [toast, setCtxRole]);

  const handleBackToCourses = useCallback(() => {
    setCourse(null);
    setRole(null);
    setCtxRole('student');
    setSelectedNodeId(null);
  }, [setCtxRole]);

  const handleAddConceptFromToolbar = useCallback(() => {
    const j = () => Math.round(Math.random() * 160 - 80);
    setAddDialog({ open: true, position: { x: 480 + j(), y: 260 + j() } });
  }, []);

  const handleRequestAddConcept = useCallback((pos) =>
    setAddDialog({ open: true, position: pos }), []);

  const handleAddSubmit = useCallback(async (formData) => {
    const node = await graph.addConcept(formData, addDialog.position);
    if (node) {
      toast.success(`"${formData.title}" added`);
      setAddDialog({ open: false, position: { x: 0, y: 0 } });
    }
  }, [graph, addDialog.position, toast]);

  const handleAddCancel    = useCallback(() => setAddDialog({ open: false, position: { x: 0, y: 0 } }), []);
  const handleNodeClick    = useCallback((_e, node) => setSelectedNodeId(node.id), []);
  const handleClosePanel   = useCallback(() => setSelectedNodeId(null), []);
  const handleNodeDragStop = useCallback((_e, node) => graph.persistNodePosition(node.id, node.position), [graph]);
  const handleConnect      = useCallback((conn) => graph.addEdgeBetween(conn.source, conn.target), [graph]);
  const handleEdgesDelete  = useCallback((del) => graph.removeEdges(del), [graph]);

  const handleNodesDelete = useCallback((deleted) => {
    deleted.forEach((n) => graph.removeConcept(n.id));
    if (deleted.some((n) => n.id === selectedNodeId)) setSelectedNodeId(null);
  }, [graph, selectedNodeId]);

  const handleMasteryChange = useCallback((id, status) => graph.setMastery(id, status), [graph]);

  const handleDeleteConcept = useCallback((id) => {
    const node = graph.nodes.find((n) => n.id === id);
    graph.removeConcept(id);
    setSelectedNodeId(null);
    if (node) toast.info(`"${node.data.title}" removed`);
  }, [graph, toast]);

  return (
    <div className="app-shell">
      <div className="bg-field" aria-hidden="true" />

      {!courseId && <LandingScreen onEnter={handleEnter} />}

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
              <span className="t-mono t-faint" style={{ fontSize: 12 }}>Loading map…</span>
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

          <SidePanel
            node={selectedNode}
            role={role}
            onClose={handleClosePanel}
            onMasteryChange={!isEducator ? handleMasteryChange : undefined}
            onDelete={isEducator ? handleDeleteConcept : undefined}
          />

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
