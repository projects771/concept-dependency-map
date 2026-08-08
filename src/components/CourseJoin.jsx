import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function CourseJoin() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.fetchCourses()
      .then(res => { if (alive) setCourses(res.courses || []); })
      .catch(err => { if (alive) toast.error('Failed to load courses'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [toast]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!courseCode.trim() || courseCode.length !== 6) {
      setError('Please enter a valid 6-character course code.');
      return;
    }
    setJoining(true);
    setError('');
    try {
      const res = await api.joinCourse(courseCode.trim());
      if (res.courseId) {
        toast.success(`Successfully joined course!`);
        navigate(`/course/${res.courseId}`);
      }
    } catch (err) {
      setError(err.message || 'Invalid course code');
      setJoining(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="ls-shell">
      <div className="ls-card animate-slide-up" style={{ minWidth: 500 }}>
        <div className="ls-course-header">
          <div>
            <Logo />
            <h1 className="ls-headline t-display" style={{ marginTop: 12 }}>My Courses</h1>
            <p className="ls-sub">
              Signed in as {user?.name} 
              <span className="ls-role-pill ls-role-pill--student" style={{ marginLeft: 8 }}>◎ Student</span>
            </p>
          </div>
          <button className="btn btn-ghost btn-sm ls-switch-role" onClick={handleSignOut}>
            ← Sign out
          </button>
        </div>

        {loading ? (
          <div className="ls-skeleton-list">
            <div className="ls-skeleton-item"><div className="skeleton" style={{ width: '55%', height: 15 }} /></div>
          </div>
        ) : courses.length > 0 ? (
          <ul className="ls-course-list">
            {courses.map(course => (
              <li key={course.id} style={{ marginBottom: 12 }}>
                <Link to={`/course/${course.id}`} className="ls-course-btn" style={{ textDecoration: 'none' }}>
                  <div className="ls-course-info">
                    <div className="ls-course-title">{course.title}</div>
                    {course.description && <div className="ls-course-desc">{course.description}</div>}
                  </div>
                  <span className="ls-course-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ls-empty">
            <div className="ls-empty-icon">◎</div>
            <div className="ls-empty-title">No courses yet</div>
            <div className="ls-empty-sub">Join a course using the 6-character code from your educator.</div>
          </div>
        )}

        <div className="ls-divider" />
        
        {showForm ? (
          <form className="ls-form animate-slide-up" onSubmit={handleJoin}>
            <div className="t-label t-faint" style={{ marginBottom: 10, letterSpacing: '0.07em', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Join Course</div>
            <input 
              className="input t-mono" 
              placeholder="e.g. AB7X92" 
              value={courseCode} 
              onChange={(e) => { setCourseCode(e.target.value.toUpperCase()); setError(''); }} 
              maxLength={6}
              autoFocus 
              required 
            />
            {error && <div className="ls-field-error" style={{ marginTop: 8 }}>{error}</div>}
            <div className="ls-form-actions" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={courseCode.length !== 6 || joining}>
                {joining ? 'Joining…' : 'Join Course'}
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => setShowForm(true)}>
            Join a course
          </button>
        )}
      </div>
    </div>
  );
}
