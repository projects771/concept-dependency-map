import React, { useEffect, useState } from 'react';
import * as api from '../api/api.js';
import { useToast } from '../context/ToastContext.jsx';
import './LandingScreen.css';

const ROLES = [
  {
    id: 'student',
    icon: '◎',
    label: 'Student',
    desc: 'Explore concepts, track mastery, see where you are on the map.',
  },
  {
    id: 'educator',
    icon: '◈',
    label: 'Educator',
    desc: 'Build and edit concept maps, define dependencies, manage courses.',
  },
];

export default function LandingScreen({ onEnter }) {
  const toast = useToast();
  const [role,        setRole]        = useState(null);   // null → show role picker
  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [creating,    setCreating]    = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!role) return;
    let alive = true;
    setLoading(true);
    api.fetchCourses()
      .then((res) => { if (alive) setCourses(res.courses ?? []); })
      .catch((e)  => { if (alive) toast.error(`Could not load courses: ${e.message}`); })
      .finally(()  => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [role]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const course = await api.createCourse({ title: title.trim(), description: description.trim() });
      toast.success(`"${course.title}" created`);
      onEnter(course, role);
    } catch (err) {
      toast.error(`Could not create course: ${err.message}`);
      setCreating(false);
    }
  }

  /* ── role selection ── */
  if (!role) {
    return (
      <div className="ls-shell">
        <div className="ls-card animate-slide-up">
          <div className="ls-logo t-mono">◈ waypoint</div>
          <h1 className="ls-headline t-display">Welcome back.</h1>
          <p className="ls-sub">How are you using the map today?</p>

          <div className="ls-roles">
            {ROLES.map((r) => (
              <button key={r.id} className="ls-role-btn" onClick={() => setRole(r.id)}>
                <span className="ls-role-icon">{r.icon}</span>
                <div className="ls-role-text">
                  <div className="ls-role-label">{r.label}</div>
                  <div className="ls-role-desc">{r.desc}</div>
                </div>
                <span className="ls-role-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── course list ── */
  const currentRole = ROLES.find((r) => r.id === role);

  return (
    <div className="ls-shell">
      <div className="ls-card animate-slide-up">
        {/* header */}
        <div className="ls-course-header">
          <div>
            <div className="ls-logo t-mono">◈ waypoint</div>
            <h1 className="ls-headline t-display">Choose your map</h1>
            <p className="ls-sub">
              Signed in as <span className="ls-role-pill">{currentRole.icon} {currentRole.label}</span>
            </p>
          </div>
          <button className="btn btn-ghost btn-sm ls-switch-role" onClick={() => { setRole(null); setCourses([]); }}>
            Switch role
          </button>
        </div>

        {/* course list */}
        {loading ? (
          <div className="ls-skeleton-list">
            {[1,2,3].map((i) => (
              <div key={i} className="ls-skeleton-item">
                <div className="skeleton" style={{ width: '60%', height: 16 }} />
                <div className="skeleton" style={{ width: '40%', height: 12, marginTop: 6 }} />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <ul className="ls-course-list">
            {courses.map((course) => (
              <li key={course.id}>
                <button className="ls-course-btn" onClick={() => onEnter(course, role)}>
                  <div className="ls-course-info">
                    <div className="ls-course-title">{course.title}</div>
                    {course.description && (
                      <div className="ls-course-desc">{course.description}</div>
                    )}
                  </div>
                  <span className="ls-course-arrow">→</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ls-empty">
            <div className="ls-empty-icon">◎</div>
            <div className="ls-empty-title">No courses yet</div>
            <div className="ls-empty-sub">Create your first concept map below.</div>
          </div>
        )}

        <div className="ls-divider" />

        {/* create form */}
        {showForm ? (
          <form className="ls-form animate-slide-up" onSubmit={handleCreate}>
            <div className="t-label t-muted" style={{ marginBottom: 10 }}>New course</div>
            <input
              className="input"
              placeholder="Course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
            <textarea
              className="input"
              style={{ marginTop: 8, minHeight: 72 }}
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <div className="ls-form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit"  className="btn btn-primary" disabled={!title.trim() || creating}>
                {creating ? 'Creating…' : 'Create & open'}
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => setShowForm(true)}>
            + New course
          </button>
        )}
      </div>
    </div>
  );
}
