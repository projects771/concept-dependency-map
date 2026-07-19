// ============================================================
// API client — matches the ConceptMap API contract exactly.
// Base URL is read from VITE_API_URL (set in .env).
// Every public function throws on failure so callers can
// handle loading / error states explicitly.
// ============================================================

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const STUDENT_ID  = import.meta.env.VITE_STUDENT_ID       || 'student1';
export const DEFAULT_COURSE = import.meta.env.VITE_DEFAULT_COURSE_ID || 'demo';

// ---------- core fetch helper ----------------------------------------
// Applies a 10-second timeout, normalises HTTP errors into thrown
// Errors with a .status field, and always returns parsed JSON.

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
  } catch (networkErr) {
    clearTimeout(timer);
    // AbortController fires a DOMException with name 'AbortError'
    const msg = networkErr.name === 'AbortError'
      ? 'Request timed out. Is the backend running?'
      : 'Network error — backend may be unreachable.';
    const err = new Error(msg);
    err.status = 0;
    throw err;
  }
  clearTimeout(timer);

  if (!res.ok) {
    let body = {};
    try { body = await res.json(); } catch { /* empty body is fine */ }
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  // 204 No Content — return null rather than trying to parse
  if (res.status === 204) return null;
  return res.json();
}

// ---------- Health ---------------------------------------------------

/** Ping the backend. Returns { status: "ok" } */
export function checkHealth() {
  return request('/health');
}

// ---------- Courses --------------------------------------------------

/**
 * GET /api/courses
 * Returns { courses: [...] }
 */
export function fetchCourses() {
  return request('/api/courses');
}

/**
 * POST /api/courses
 * Body: { title, description, educatorId }
 * Returns the created course object (201)
 */
export function createCourse({ title, description, educatorId = 'educator1' }) {
  return request('/api/courses', {
    method: 'POST',
    body: JSON.stringify({ title, description, educatorId }),
  });
}

/**
 * GET /api/courses/:id
 * Returns { course, concepts, edges }
 * concepts: [{ id, title, courseId, x, y }]
 * edges:    [{ from, to }]
 */
export function fetchCourse(id) {
  return request(`/api/courses/${id}`);
}

/**
 * DELETE /api/courses/:id
 * Returns { deleted: id }
 */
export function deleteCourse(id) {
  return request(`/api/courses/${id}`, { method: 'DELETE' });
}

// ---------- Concepts -------------------------------------------------

/**
 * GET /api/concepts?courseId=demo
 * Returns { concepts: [...], edges: [...] }
 * concepts: [{ id, title, courseId, x, y }]
 * edges:    [{ from, to }]
 */
export function fetchConcepts(courseId) {
  return request(`/api/concepts?courseId=${encodeURIComponent(courseId)}`);
}

/**
 * POST /api/concepts
 * Body: { title, description, courseId, x, y }
 * Required: title, courseId, x, y
 * Returns the created concept (201): { id, title, description, courseId, x, y }
 */
export function createConcept({ title, description = '', courseId, x, y }) {
  return request('/api/concepts', {
    method: 'POST',
    body: JSON.stringify({ title, description, courseId, x, y }),
  });
}

/**
 * DELETE /api/concepts/:id
 * Returns { deleted: id }
 */
export function deleteConcept(id) {
  return request(`/api/concepts/${id}`, { method: 'DELETE' });
}

/**
 * POST /api/concepts/edge
 * Body: { fromId, toId, courseId }
 * fromId is the prerequisite, toId depends on it.
 * Returns { from, to } (201)
 */
export function createEdge(fromId, toId, courseId) {
  return request('/api/concepts/edge', {
    method: 'POST',
    body: JSON.stringify({ fromId, toId, courseId }),
  });
}

// ---------- Mastery --------------------------------------------------

/**
 * PATCH /api/mastery/:conceptId
 * Body: { studentId, status }   status ∈ learning | confident | struggling
 * Returns { studentId, conceptId, status }
 */
export function updateMastery(conceptId, status, studentId = STUDENT_ID) {
  return request(`/api/mastery/${conceptId}`, {
    method: 'PATCH',
    body: JSON.stringify({ studentId, status }),
  });
}

/**
 * GET /api/mastery/:studentId
 * Returns { studentId, mastery: [{ conceptId, status }] }
 */
export function fetchMastery(studentId = STUDENT_ID) {
  return request(`/api/mastery/${studentId}`);
}

// ---------- Gaps -----------------------------------------------------

/**
 * GET /api/gaps/:conceptId?studentId=student1
 * Returns {
 *   gapConceptId,
 *   studentId,
 *   atRisk: [{ id, title, distance, status, risk }]
 * }
 * risk ∈ high | medium | unknown | safe
 */
export function fetchGaps(conceptId, studentId = STUDENT_ID) {
  return request(
    `/api/gaps/${encodeURIComponent(conceptId)}?studentId=${encodeURIComponent(studentId)}`
  );
}
