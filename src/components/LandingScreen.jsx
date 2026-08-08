import React, { useEffect, useRef, useState } from 'react';
import * as api from '../api/api.js';
import { useToast } from '../context/ToastContext.jsx';
import './LandingScreen.css';

// Demo EID. Replace with real backend auth check when Person B adds it.
const VALID_EID = 'EID-2024';

export default function LandingScreen({ onEnter }) {
  const toast = useToast();

  // Step 1: pick role → 'student' | 'educator'
  // Step 2 (educator only): enter EID → verified: boolean
  // Step 3: view/create courses
  const [step,        setStep]        = useState('pick-role'); // 'pick-role' | 'verify-eid' | 'courses'
  const [role,        setRole]        = useState(null);
  const [eid,         setEid]         = useState('');
  const [eidError,    setEidError]    = useState('');
  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [creating,    setCreating]    = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const eidRef = useRef(null);

  // Load courses once we reach the 'courses' step
  useEffect(() => {
    if (step !== 'courses') return;
    let alive = true;
    setLoading(true);
    api.fetchCourses()
      .then((res) => { if (alive) setCourses(res.courses ?? []); })
      .catch((e)  => { if (alive) toast.error(`Could not load courses: ${e.message}`); })
      .finally(()  => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [step]);

  useEffect(() => {
    if (step === 'verify-eid') setTimeout(() => eidRef.current?.focus(), 60);
  }, [step]);

  function handleRolePick(r) {
    setRole(r);
    setStep('courses');
  }

  function handleEidSubmit(e) {
    e.preventDefault();
    setEidError('');
    if (eid.trim().toUpperCase() !== VALID_EID) {
      setEidError('Invalid Educator ID. Please check and try again.');
      return;
    }
    setStep('courses');
  }

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

  function handleBack() {
    setStep('pick-role');
    setRole(null);
    setEid('');
    setEidError('');
    setCourses([]);
    setShowForm(false);
    setTitle('');
    setDescription('');
  }

  /* ── Step 1: Role picker ── */
  if (step === 'pick-role') {
    return (
      <div className="ls-shell">
        <div className="ls-card animate-slide-up">
          <div className="ls-logo t-mono">◈ waypoint</div>
          <h1 className="ls-headline t-display">Welcome back.</h1>
          <p className="ls-sub">How are you joining today?</p>

          <div className="ls-roles">
            <button className="ls-role-btn" onClick={() => handleRolePick('student')}>
              <span className="ls-role-icon ls-role-icon--student">◎</span>
              <div className="ls-role-text">
                <div className="ls-role-label">Student</div>
                <div className="ls-role-desc">Explore concepts, track your mastery, navigate the map.</div>
              </div>
              <span className="ls-role-arrow">→</span>
            </button>

            <button className="ls-role-btn" onClick={() => handleRolePick('educator')}>
              <span className="ls-role-icon ls-role-icon--educator">◈</span>
              <div className="ls-role-text">
                <div className="ls-role-label">Educator</div>
                <div className="ls-role-desc">Build concept maps, manage courses, define dependencies.</div>
              </div>
              <span className="ls-role-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  /* ── Step 3: Course list ── */
  const roleLabel = role === 'educator' ? 'Educator' : 'Student';
  const roleIcon  = role === 'educator' ? '◈' : '◎';

  return (
    <div className="ls-shell">
      <div className="ls-card animate-slide-up">
        {/* header — NO "Switch role" button (role is permanent per session) */}
        <div className="ls-course-header">
          <div>
            <div className="ls-logo t-mono">◈ waypoint</div>
            <h1 className="ls-headline t-display">Choose your map</h1>
            <p className="ls-sub">
              Signed in as{' '}
              <span className={`ls-role-pill ls-role-pill--${role}`}>
                {roleIcon} {roleLabel}
              </span>
            </p>
          </div>
          {/* Back to role picker — but label it clearly */}
          <button className="btn btn-ghost btn-sm ls-switch-role" onClick={handleBack}>
            ← Sign out
          </button>
        </div>

        {/* courses */}
        {loading ? (
          <div className="ls-skeleton-list">
            {[1,2,3].map((i) => (
              <div key={i} className="ls-skeleton-item">
                <div className="skeleton" style={{ width: '55%', height: 15 }} />
                <div className="skeleton" style={{ width: '38%', height: 11, marginTop: 7 }} />
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
            <div className="ls-empty-sub">
              {role === 'educator'
                ? 'Create your first concept map below.'
                : 'Ask your educator to create a course.'}
            </div>
          </div>
        )}

        {/* create form — educators only */}
        {role === 'educator' && (
          <>
            <div className="ls-divider" />
            {showForm ? (
              <form className="ls-form animate-slide-up" onSubmit={handleCreate}>
                <div className="t-label t-faint" style={{ marginBottom: 10, letterSpacing: '0.07em', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>New course</div>
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
          </>
        )}
      </div>
    </div>
  );
}
