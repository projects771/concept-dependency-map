import React, { useEffect, useState } from 'react';
import * as api from '../api/api.js';
import './CoursePicker.css';

export default function CoursePicker({ onSelect }) {
  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [creating,    setCreating]    = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.fetchCourses();
        if (alive) setCourses(res.courses ?? []);
      } catch (e) {
        if (alive) setError(
          e.status === 0
            ? 'Cannot reach the backend. Is it running on port 4000?'
            : `Could not load courses: ${e.message}`
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const course = await api.createCourse({ title: title.trim(), description: description.trim() });
      onSelect(course);
    } catch (err) {
      setError(`Could not create course: ${err.message}`);
      setCreating(false);
    }
  }

  return (
    <div className="cp-shell">
      <div className="cp-card">
        <div className="cp-eyebrow font-mono">Waypoint ◈</div>
        <h1 className="cp-title font-display">Choose your map</h1>
        <p className="cp-subtitle">Select a course to explore, or chart a new one.</p>

        {error && <div className="cp-error">{error}</div>}

        {loading ? (
          <div className="cp-loading">
            <span className="cp-spinner" />
            <span className="font-mono">Loading courses…</span>
          </div>
        ) : (
          <>
            {courses.length > 0 ? (
              <ul className="cp-list">
                {courses.map((course) => (
                  <li key={course.id}>
                    <button className="cp-course-btn" onClick={() => onSelect(course)}>
                      <span className="cp-course-title font-display">{course.title}</span>
                      {course.description && (
                        <span className="cp-course-desc">{course.description}</span>
                      )}
                      <span className="cp-course-arrow" aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cp-empty font-mono">No courses yet — create the first one below.</p>
            )}

            <div className="cp-divider" />

            {showForm ? (
              <form className="cp-form" onSubmit={handleCreate}>
                <div className="cp-form-eyebrow font-mono">New course</div>
                <input
                  className="cp-input"
                  placeholder="Course title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
                <textarea
                  className="cp-input cp-textarea"
                  placeholder="Short description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
                <div className="cp-form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!title.trim() || creating}>
                    {creating ? 'Creating…' : 'Create & open'}
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn btn-primary cp-new-btn" onClick={() => setShowForm(true)}>
                + New course
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
