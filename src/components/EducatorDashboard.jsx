import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function EducatorDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let alive = true;
    api.fetchCourses()
      .then(res => { if (alive) setCourses(res.courses || []); })
      .catch(err => { if (alive) toast.error('Failed to load courses'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [toast]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const course = await api.createCourse({ title: title.trim(), description: description.trim() });
      toast.success(`Course "${course.title}" created`);
      navigate(`/course/${course.id}/edit`);
    } catch (err) {
      toast.error(err.message);
      setCreating(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Course code copied!');
  };

  return (
    <div className="ls-shell">
      <div className="ls-card animate-slide-up" style={{ minWidth: 600 }}>
        <div className="ls-course-header">
          <div>
            <div className="ls-logo t-mono">◈ waypoint</div>
            <h1 className="ls-headline t-display">Educator Dashboard</h1>
            <p className="ls-sub">
              Signed in as {user?.name} 
              <span className="ls-role-pill ls-role-pill--educator" style={{ marginLeft: 8 }}>◈ Educator</span>
            </p>
          </div>
          <button className="btn btn-ghost btn-sm ls-switch-role" onClick={handleSignOut}>
            ← Sign out
          </button>
        </div>

        {loading ? (
          <div className="ls-skeleton-list">
            <div className="ls-skeleton-item"><div className="skeleton" style={{ width: '55%', height: 15 }} /></div>
            <div className="ls-skeleton-item"><div className="skeleton" style={{ width: '55%', height: 15 }} /></div>
          </div>
        ) : courses.length > 0 ? (
          <ul className="ls-course-list">
            {courses.map(course => (
              <li key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 20px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="ls-course-title" style={{ fontSize: 16 }}>{course.title}</div>
                    {course.description && <div className="ls-course-desc">{course.description}</div>}
                  </div>
                  <Link to={`/course/${course.id}/edit`} className="btn btn-primary btn-sm">Edit Graph →</Link>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid var(--c-border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 13 }}>
                    <span className="t-faint">Share code: </span>
                    <code className="t-mono" style={{ background: 'var(--c-surface)', padding: '2px 6px', borderRadius: 4, color: 'var(--c-accent)' }}>{course.courseCode}</code>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', marginLeft: 8, height: 'auto', fontSize: 12 }} onClick={() => copyCode(course.courseCode)}>Copy</button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--c-faint)' }}>
                    • {Math.floor(Math.random() * 20) + 1} students enrolled
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ls-empty">
            <div className="ls-empty-icon">◈</div>
            <div className="ls-empty-title">No courses yet</div>
            <div className="ls-empty-sub">Create your first concept map below.</div>
          </div>
        )}

        <div className="ls-divider" />
        
        {showForm ? (
          <form className="ls-form animate-slide-up" onSubmit={handleCreate}>
            <div className="t-label t-faint" style={{ marginBottom: 10, letterSpacing: '0.07em', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>New course</div>
            <input className="input" placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
            <textarea className="input" style={{ marginTop: 8, minHeight: 72 }} placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            <div className="ls-form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!title.trim() || creating}>
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
