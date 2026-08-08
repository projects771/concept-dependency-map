const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const STUDENT_ID    = import.meta.env.VITE_STUDENT_ID       || 'student1';
export const DEFAULT_COURSE = import.meta.env.VITE_DEFAULT_COURSE_ID || 'demo';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
  } catch (e) {
    clearTimeout(timer);
    const err = new Error(
      e.name === 'AbortError'
        ? 'Request timed out — is the backend running?'
        : 'Network error — backend may be unreachable.'
    );
    err.status = 0;
    throw err;
  }
  clearTimeout(timer);
  if (!res.ok) {
    let body = {};
    try { body = await res.json(); } catch {}
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const checkHealth   = ()        => request('/health');
export const fetchCourses  = ()        => request('/api/courses');
export const fetchCourse   = (id)      => request(`/api/courses/${id}`);
export const deleteCourse  = (id)      => request(`/api/courses/${id}`, { method: 'DELETE' });

export const createCourse  = ({ title, description, educatorId = 'educator1' }) =>
  request('/api/courses', { method: 'POST', body: JSON.stringify({ title, description, educatorId }) });

export const fetchConcepts = (courseId) =>
  request(`/api/concepts?courseId=${encodeURIComponent(courseId)}`);

export const createConcept = ({ title, description = '', courseId, x, y }) =>
  request('/api/concepts', { method: 'POST', body: JSON.stringify({ title, description, courseId, x, y }) });

export const deleteConcept = (id)      => request(`/api/concepts/${id}`, { method: 'DELETE' });

export const createEdge    = (fromId, toId, courseId) =>
  request('/api/concepts/edge', { method: 'POST', body: JSON.stringify({ fromId, toId, courseId }) });

export const updateMastery = (conceptId, status, studentId = STUDENT_ID) =>
  request(`/api/mastery/${conceptId}`, { method: 'PATCH', body: JSON.stringify({ studentId, status }) });

export const fetchMastery  = (studentId = STUDENT_ID) =>
  request(`/api/mastery/${studentId}`);

export const fetchGaps     = (conceptId, studentId = STUDENT_ID) =>
  request(`/api/gaps/${encodeURIComponent(conceptId)}?studentId=${encodeURIComponent(studentId)}`);

export const updateConceptPosition = (id, x, y, title, description) =>
  request(`/api/concepts/${id}`, { method: 'PATCH', body: JSON.stringify({ x, y, title, description }) });

export const updateConceptResources = (id, resources) =>
  request(`/api/concepts/${id}/resources`, { method: 'PATCH', body: JSON.stringify({ resources }) });

export const fetchAnalytics = (courseId) =>
  request(`/api/analytics/${encodeURIComponent(courseId)}`);
