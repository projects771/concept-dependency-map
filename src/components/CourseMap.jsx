import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import { useToast } from '../context/ToastContext.jsx';
import { useRole } from '../context/RoleContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useGraph } from '../hooks/useGraph.js';
import GraphCanvas from './GraphCanvas.jsx';
import SidePanel from './SidePanel.jsx';
import Toolbar from './Toolbar.jsx';
import AddConceptDialog from './AddConceptDialog.jsx';
import AnalyticsPanel from './AnalyticsPanel.jsx';

export default function CourseMap() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const role = user?.role || 'student';
  const { setRole: setCtxRole } = useRole();

  useEffect(() => {
    setCtxRole(role);
  }, [role, setCtxRole]);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [addDialog, setAddDialog] = useState({ open: false, position: { x: 0, y: 0 } });

  const isEducator = role === 'educator';
  const graph = useGraph(courseId, toast);

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph.nodes, selectedNodeId]
  );

  const handleBackToCourses = useCallback(() => {
    navigate(isEducator ? '/dashboard' : '/student/join');
  }, [navigate, isEducator]);

  const handleAddConceptFromToolbar = useCallback(() => {
    const j = () => Math.round(Math.random() * 160 - 80);
    setAddDialog({ open: true, position: { x: 480 + j(), y: 260 + j() } });
  }, []);

  const handleRequestAddConcept = useCallback((pos) => setAddDialog({ open: true, position: pos }), []);

  const handleAddSubmit = useCallback(async (formData) => {
    const node = await graph.addConcept(formData, addDialog.position);
    if (node) {
      toast.success(`"${formData.title}" added`);
      setAddDialog({ open: false, position: { x: 0, y: 0 } });
    }
  }, [graph, addDialog.position, toast]);

  const handleAddCancel = useCallback(() => setAddDialog({ open: false, position: { x: 0, y: 0 } }), []);
  const handleNodeClick = useCallback((_e, node) => setSelectedNodeId(node.id), []);
  const handleClosePanel = useCallback(() => setSelectedNodeId(null), []);
  const handleNodeDragStop = useCallback((_e, node) => graph.persistNodePosition(node.id, node.position, node.data), [graph]);
  const handleConnect = useCallback((conn) => graph.addEdgeBetween(conn.source, conn.target), [graph]);
  const handleEdgesDelete = useCallback((del) => graph.removeEdges(del), [graph]);

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
    <>
      <Toolbar
        role={role}
        course={graph.course}
        onAddConcept={isEducator ? handleAddConceptFromToolbar : undefined}
        onBackToCourses={handleBackToCourses}
        saving={graph.saving}
        onRelayout={isEducator ? graph.relayout : undefined}
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
        nodes={graph.nodes}
        edges={graph.edges}
        role={role}
        onClose={handleClosePanel}
        onMasteryChange={!isEducator ? handleMasteryChange : undefined}
        onDelete={isEducator ? handleDeleteConcept : undefined}
        onUpdateResources={isEducator ? graph.updateResources : undefined}
      />

      {isEducator && <AnalyticsPanel courseId={courseId} />}

      {isEducator && (
        <AddConceptDialog
          open={addDialog.open}
          onCancel={handleAddCancel}
          onSubmit={handleAddSubmit}
          submitting={graph.saving}
        />
      )}
    </>
  );
}
