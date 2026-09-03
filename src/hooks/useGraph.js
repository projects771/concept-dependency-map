import { useCallback, useEffect, useState } from 'react';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import dagre from '@dagrejs/dagre';
import * as api from '../api/api.js';

const NODE_TYPE = 'concept';

const getLayoutedElements = (nodes, edges) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  nodes.forEach(node => g.setNode(node.id, { width: 160, height: 44 }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));

  dagre.layout(g);

  return {
    nodes: nodes.map(node => {
      const { x, y } = g.node(node.id);
      return { ...node, position: { x: x - 80, y: y - 22 } };
    }),
    edges,
  };
};

function needsLayout(nodes) {
  if (nodes.length === 0) return false;
  if (nodes.every(n => n.position.x === 0 && n.position.y === 0)) return true;
  const posSet = new Set();
  for (const n of nodes) {
    const key = `${n.position.x},${n.position.y}`;
    if (posSet.has(key)) return true;
    posSet.add(key);
  }
  return false;
}

function toFlowNode(concept, masteryMap = {}) {
  let resources = [];
  if (typeof concept.resources === 'string') {
    try { resources = JSON.parse(concept.resources); } catch (e) {}
  } else if (Array.isArray(concept.resources)) {
    resources = concept.resources;
  }
  return {
    id: String(concept.id),
    type: NODE_TYPE,
    position: { x: Number(concept.x) || 0, y: Number(concept.y) || 0 },
    data: {
      title:       concept.title,
      description: concept.description || '',
      resources,
      mastery:     masteryMap[concept.id] ?? concept.mastery ?? 'learning',
      gapRisk:     false,
      gapMeta:     null,
    },
  };
}

function toFlowEdge(edge) {
  const source = String(edge.from   ?? edge.source);
  const target = String(edge.to     ?? edge.target);
  return { id: edge.id ?? `e${source}-${target}`, source, target };
}

export function useGraph(courseId, toast) {
  const [course,       setCourse]       = useState(null);
  const [nodes,        setNodes]        = useState([]);
  const [edges,        setEdges]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const withPending = useCallback(async (fn) => {
    setPendingCount((c) => c + 1);
    try   { return await fn(); }
    finally { setPendingCount((c) => c - 1); }
  }, []);

  // ── initial load ──────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [conceptsRes, masteryRes] = await Promise.allSettled([
          api.fetchConcepts(courseId),
          api.fetchMastery(),
        ]);
        if (!alive) return;
        if (conceptsRes.status === 'rejected') throw conceptsRes.reason;

        const { course: loadedCourse = null, concepts = [], edges = [] } = conceptsRes.value;
        const masteryMap = {};
        if (masteryRes.status === 'fulfilled') {
          (masteryRes.value?.mastery ?? []).forEach(({ conceptId, status }) => {
            masteryMap[conceptId] = status;
          });
        }
        
        let loadedNodes = concepts.map((c) => toFlowNode(c, masteryMap));
        const rawEdges = edges.map(toFlowEdge);

        // Filter out ghost edges (source/target node was deleted)
        const validNodeIds = new Set(loadedNodes.map(n => n.id));
        const loadedEdges = rawEdges.filter(e =>
          validNodeIds.has(e.source) && validNodeIds.has(e.target)
        );
        
        if (needsLayout(loadedNodes)) {
          const layouted = getLayoutedElements(loadedNodes, loadedEdges);
          loadedNodes = layouted.nodes;
        }

        setCourse(loadedCourse);
        setNodes(loadedNodes);
        setEdges(loadedEdges);
      } catch (e) {
        if (alive) toast?.error(`Failed to load course: ${e.message}`);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [courseId]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const relayout = useCallback(() => {
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    toast?.success('Auto-layout applied (drag nodes to save position)');
  }, [nodes, edges, toast]);

  const persistNodePosition = useCallback((id, position, data) => {
    withPending(async () => {
      try {
        await api.updateConceptPosition(id, Math.round(position.x), Math.round(position.y), data?.title, data?.description || '');
      } catch (e) {
        toast?.error(`Could not save position: ${e.message}`);
      }
    });
  }, [withPending, toast]);

  const addConcept = useCallback(async (formData, position) => {
    return withPending(async () => {
      try {
        const created = await api.createConcept({
          title: formData.title,
          description: formData.description ?? '',
          courseId,
          x: Math.round(position.x),
          y: Math.round(position.y),
        });
        const node = toFlowNode(created);
        setNodes((nds) => nds.concat(node));
        toast?.success(`"${created.title}" added to the map`);
        return node;
      } catch (e) {
        toast?.error(`Could not add concept: ${e.message}`);
        return null;
      }
    });
  }, [courseId, withPending, toast]);

  const removeConcept = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    withPending(async () => {
      try {
        await api.deleteConcept(id);
        toast?.success('Concept removed');
      } catch (e) {
        toast?.error(`Could not delete concept: ${e.message}`);
      }
    });
  }, [withPending, toast]);

  const addEdgeBetween = useCallback((source, target) => {
    if (source === target) return;
    withPending(async () => {
      try {
        const created = await api.createEdge(source, target, courseId);
        setEdges((eds) => eds.concat({
          id: `e${created.from}-${created.to}`,
          source: created.from, target: created.to,
        }));
        toast?.success('Dependency added');
      } catch (e) {
        toast?.error(`Could not save dependency: ${e.message}`);
      }
    });
  }, [courseId, withPending, toast]);

  const removeEdges = useCallback((edgesToRemove) => {
    const ids = new Set(edgesToRemove.map((e) => e.id));
    setEdges((eds) => eds.filter((e) => !ids.has(e.id)));
    
    withPending(async () => {
      try {
        await Promise.all(edgesToRemove.map(e => api.deleteEdge(e.source, e.target)));
        toast?.success('Dependency removed');
      } catch (e) {
        toast?.error(`Could not delete dependency: ${e.message}`);
      }
    });
  }, [withPending, toast]);

  const setMastery = useCallback((id, status) => {
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, mastery: status } } : n));

    withPending(async () => {
      try {
        await api.updateMastery(id, status);
        toast?.success(`Status updated to ${status}`);
      } catch (e) {
        toast?.error(`Could not save status: ${e.message}`);
      }
    });

    if (status === 'struggling') {
      withPending(async () => {
        try {
          const res = await api.fetchGaps(id);
          const atRiskMap = new Map((res.atRisk ?? []).map((item) => [item.id, item]));
          setNodes((nds) => nds.map((n) => {
            if (!atRiskMap.has(n.id)) return n;
            const meta = atRiskMap.get(n.id);
            return { ...n, data: { ...n.data, gapRisk: true, gapMeta: { distance: meta.distance, risk: meta.risk, status: meta.status } } };
          }));
          const count = atRiskMap.size;
          if (count > 0) toast?.warning(`${count} downstream concept${count !== 1 ? 's' : ''} flagged as at-risk`);
        } catch (e) {
          toast?.error(`Could not check gaps: ${e.message}`);
        }
      });
    } else {
      setNodes((nds) =>
        nds.map((n) => n.id === id ? { ...n, data: { ...n.data, gapRisk: false, gapMeta: null } } : n));
    }
  }, [withPending, toast]);

  const updateResources = useCallback((id, resources) => {
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, resources } } : n));
    withPending(async () => {
      try {
        await api.updateConceptResources(id, resources);
        toast?.success('Resources updated');
      } catch (e) {
        toast?.error(`Could not update resources: ${e.message}`);
      }
    });
  }, [withPending, toast]);

  return {
    course,
    nodes, edges, loading,
    saving: pendingCount > 0,
    setNodes, setEdges,
    onNodesChange, onEdgesChange,
    persistNodePosition,
    addConcept, removeConcept,
    addEdgeBetween, removeEdges,
    setMastery, updateResources,
    relayout,
  };
}
