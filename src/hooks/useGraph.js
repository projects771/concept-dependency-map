import { useCallback, useEffect, useState } from 'react';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import * as api from '../api/api.js';

const NODE_TYPE = 'concept';

function toFlowNode(concept, masteryMap = {}) {
  return {
    id: concept.id,
    type: NODE_TYPE,
    position: { x: Number(concept.x) || 0, y: Number(concept.y) || 0 },
    data: {
      title:       concept.title,
      description: concept.description || '',
      resources:   concept.resources   || [],
      mastery:     masteryMap[concept.id] ?? concept.mastery ?? 'learning',
      gapRisk:     false,
      gapMeta:     null,
    },
  };
}

function toFlowEdge(edge) {
  const source = edge.from   ?? edge.source;
  const target = edge.to     ?? edge.target;
  return { id: edge.id ?? `e${source}-${target}`, source, target, type: 'trail' };
}

export function useGraph(courseId, toast) {
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

        const { concepts = [], edges = [] } = conceptsRes.value;
        const masteryMap = {};
        if (masteryRes.status === 'fulfilled') {
          (masteryRes.value?.mastery ?? []).forEach(({ conceptId, status }) => {
            masteryMap[conceptId] = status;
          });
        }
        setNodes(concepts.map((c) => toFlowNode(c, masteryMap)));
        setEdges(edges.map(toFlowEdge));
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

  // position not in API contract — no-op but keeps interface stable
  const persistNodePosition = useCallback(() => {}, []);

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
          source: created.from, target: created.to, type: 'trail',
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
    toast?.info('Edge removed (local only — backend endpoint pending)');
  }, [toast]);

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

  return {
    nodes, edges, loading,
    saving: pendingCount > 0,
    setNodes, setEdges,
    onNodesChange, onEdgesChange,
    persistNodePosition,
    addConcept, removeConcept,
    addEdgeBetween, removeEdges,
    setMastery,
  };
}
