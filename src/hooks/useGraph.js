import { useCallback, useEffect, useState } from 'react';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import * as api from '../api/api.js';

const NODE_TYPE = 'concept';

// ── shape adapters ──────────────────────────────────────────────────────────
// The backend stores position as top-level x / y fields.
// React Flow needs { position: { x, y } }.
// Edges: backend uses from/to; React Flow uses source/target.

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
      gapRisk:     false,    // populated by setMastery → fetchGaps
      gapMeta:     null,     // { distance, risk } from gap response
    },
  };
}

function toFlowEdge(edge) {
  // API returns { from, to }; React Flow needs { source, target, id }
  const source = edge.from   ?? edge.source;
  const target = edge.to     ?? edge.target;
  return {
    id:     edge.id ?? `e${source}-${target}`,
    source,
    target,
    type:   'trail',
  };
}

// ── hook ────────────────────────────────────────────────────────────────────

export function useGraph(courseId) {
  const [nodes,        setNodes]        = useState([]);
  const [edges,        setEdges]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Track in-flight writes for the "Saving…" toolbar indicator
  const withPending = useCallback(async (fn) => {
    setPendingCount((c) => c + 1);
    try   { return await fn(); }
    finally { setPendingCount((c) => c - 1); }
  }, []);

  // ── initial load ──────────────────────────────────────────────────────────
  // 1. Load concepts + edges for the course
  // 2. Load mastery for the current student in parallel
  // 3. Merge mastery into node data

  useEffect(() => {
    if (!courseId) return;

    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fire both requests concurrently
        const [conceptsRes, masteryRes] = await Promise.allSettled([
          api.fetchConcepts(courseId),
          api.fetchMastery(),           // GET /api/mastery/:studentId
        ]);

        if (!alive) return;

        if (conceptsRes.status === 'rejected') {
          throw conceptsRes.reason;
        }

        const { concepts = [], edges = [] } = conceptsRes.value;

        // Build a conceptId → status lookup from mastery (may be unavailable)
        const masteryMap = {};
        if (masteryRes.status === 'fulfilled') {
          (masteryRes.value?.mastery ?? []).forEach(({ conceptId, status }) => {
            masteryMap[conceptId] = status;
          });
        }

        setNodes(concepts.map((c) => toFlowNode(c, masteryMap)));
        setEdges(edges.map(toFlowEdge));
      } catch (e) {
        if (alive) {
          setError(
            e.status === 0
              ? 'Cannot reach the backend. Is it running on port 4000?'
              : `Failed to load course: ${e.message}`
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [courseId]);

  // ── React Flow change handlers ────────────────────────────────────────────

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // ── position persistence ──────────────────────────────────────────────────
  // NOTE: The API contract (v1) has no PATCH /concepts/:id/position endpoint.
  // Positions are persisted on creation only. This is a known gap — raise it
  // with Person B. For now we update local state immediately on drop so the
  // UI stays responsive, without making a failing network call.
  const persistNodePosition = useCallback((_id, _position) => {
    // no-op: position update endpoint not in API contract yet
  }, []);

  // ── add concept ───────────────────────────────────────────────────────────
  // API body: { title, description, courseId, x, y }

  const addConcept = useCallback(
    async (formData, position) => {
      return withPending(async () => {
        try {
          const created = await api.createConcept({
            title:       formData.title,
            description: formData.description ?? '',
            courseId,
            x: Math.round(position.x),
            y: Math.round(position.y),
          });
          const node = toFlowNode(created);
          setNodes((nds) => nds.concat(node));
          return node;
        } catch (e) {
          setError(`Could not add concept: ${e.message}`);
          return null;
        }
      });
    },
    [courseId, withPending]
  );

  // ── remove concept ────────────────────────────────────────────────────────

  const removeConcept = useCallback(
    (id) => {
      // Optimistic local update first
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));

      withPending(async () => {
        try {
          await api.deleteConcept(id);  // DELETE /api/concepts/:id
        } catch (e) {
          setError(`Could not delete concept: ${e.message}`);
          // TODO: roll back optimistic delete on error
        }
      });
    },
    [withPending]
  );

  // ── edges ─────────────────────────────────────────────────────────────────
  // API body: { fromId, toId, courseId }
  // NOTE: The API contract has no DELETE /api/edges endpoint.
  // Edge removal is local-only; raise with Person B.

  const addEdgeBetween = useCallback(
    (source, target) => {
      if (source === target) return;

      withPending(async () => {
        try {
          const created = await api.createEdge(source, target, courseId);
          setEdges((eds) =>
            eds.concat({
              id:     `e${created.from}-${created.to}`,
              source: created.from,
              target: created.to,
              type:   'trail',
            })
          );
        } catch (e) {
          setError(`Could not save dependency: ${e.message}`);
        }
      });
    },
    [courseId, withPending]
  );

  const removeEdges = useCallback(
    (edgesToRemove) => {
      // Local-only — no DELETE /api/edges in contract
      const ids = new Set(edgesToRemove.map((e) => e.id));
      setEdges((eds) => eds.filter((e) => !ids.has(e.id)));
      // Note in console so Person B knows this isn't persisted yet
      console.warn('[useGraph] Edge deletion is local-only (no API endpoint yet):', edgesToRemove);
    },
    []
  );

  // ── mastery + gap detection ───────────────────────────────────────────────
  // PATCH /api/mastery/:conceptId  body: { studentId, status }
  // GET   /api/gaps/:conceptId?studentId=...
  //   → atRisk: [{ id, title, distance, status, risk }]

  const setMastery = useCallback(
    (id, status) => {
      // Optimistic UI update
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, mastery: status } } : n
        )
      );

      // Persist to backend
      withPending(async () => {
        try {
          await api.updateMastery(id, status);
        } catch (e) {
          setError(`Could not save mastery: ${e.message}`);
        }
      });

      if (status === 'struggling') {
        // Fetch downstream at-risk concepts and mark them on the canvas
        withPending(async () => {
          try {
            const res = await api.fetchGaps(id);
            // res.atRisk: [{ id, title, distance, status, risk }]
            const atRiskMap = new Map(
              (res.atRisk ?? []).map((item) => [item.id, item])
            );
            setNodes((nds) =>
              nds.map((n) => {
                if (atRiskMap.has(n.id)) {
                  const meta = atRiskMap.get(n.id);
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      gapRisk: true,
                      gapMeta: {
                        distance: meta.distance,
                        risk:     meta.risk,   // high | medium | unknown | safe
                        status:   meta.status,
                      },
                    },
                  };
                }
                return n;
              })
            );
          } catch (e) {
            setError(`Could not check downstream gaps: ${e.message}`);
          }
        });
      } else {
        // Clearing struggle state: remove gap badge from this node only.
        // (Other nodes' gap badges were set by their own struggling ancestors
        //  and are cleared when those are resolved.)
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id
              ? { ...n, data: { ...n.data, gapRisk: false, gapMeta: null } }
              : n
          )
        );
      }
    },
    [withPending]
  );

  return {
    nodes,
    edges,
    loading,
    error,
    saving:       pendingCount > 0,
    // mockMode removed — we no longer fall back to mocks
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    persistNodePosition,
    addConcept,
    removeConcept,
    addEdgeBetween,
    removeEdges,
    setMastery,
    dismissError: () => setError(null),
  };
}
