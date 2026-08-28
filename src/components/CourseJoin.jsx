import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import GraphBackground from './GraphBackground.jsx';

export default function CourseJoin() {
  const [chars, setChars] = useState(['', '', '', '', '', '']);
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [validating, setValidating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch enrolled courses
    const loadCourses = async () => {
      try {
        const courses = await api.fetchCourses();
        if (courses) {
          setEnrolledCourses(courses);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    if (user) {
      loadCourses();
    }
  }, [user]);

  const handleChange = (index, value) => {
    const newChars = [...chars];
    newChars[index] = value.slice(-1).toUpperCase(); // only take last char
    setChars(newChars);
    
    // Auto-advance
    if (value && index < 5) {
      refs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      refs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
    const newChars = [...chars];
    for (let i = 0; i < pastedData.length; i++) {
      newChars[i] = pastedData[i];
    }
    setChars(newChars);
    const focusIndex = Math.min(pastedData.length, 5);
    if (focusIndex < 6) {
      refs[focusIndex].current.focus();
    } else {
      refs[5].current.focus();
    }
  };

  const isComplete = chars.every(char => char !== '');

  const handleJoin = async () => {
    if (!isComplete) return;
    setValidating(true);
    setLocalError('');
    const courseCode = chars.join('');
    try {
      const response = await api.joinCourse(courseCode);
      if (response && (response.courseId || response.id || response._id)) {
        toast.success('Successfully joined course!');
        navigate(`/course/${response.courseId || response.id || response._id}`);
      } else {
        setLocalError('Failed to join course.');
      }
    } catch (err) {
      setLocalError(err.message || 'Invalid course code or error joining.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="ls-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--c-bg, #111)', padding: '20px' }}>
      <GraphBackground />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', width: '100%', padding: '40px', backgroundColor: 'rgba(30, 30, 30, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid var(--c-border, #333)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔗</div>
        <h2 style={{ color: 'var(--brand-accent, #3b82f6)', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '8px', textAlign: 'center' }}>Enter your course code</h2>
        <p style={{ color: 'var(--c-text-muted, #9ca3af)', textAlign: 'center', marginBottom: '32px', fontSize: '0.95rem' }}>Your educator shared a 6-character code to join their course map</p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {chars.map((char, index) => (
            <input
              key={index}
              ref={refs[index]}
              type="text"
              value={char}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              style={{
                width: '52px',
                height: '56px',
                backgroundColor: 'var(--c-surface-2, #2a2a2a)',
                border: '1px solid var(--c-border, #444)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '22px',
                fontWeight: '600',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                color: 'var(--c-text, #fff)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand-accent, #3b82f6)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--c-border, #444)'}
            />
          ))}
        </div>

        {localError && (
          <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>{localError}</div>
        )}

        <button
          onClick={handleJoin}
          disabled={!isComplete || validating}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isComplete ? 'var(--brand-accent, #3b82f6)' : 'var(--c-surface-2, #2a2a2a)',
            color: isComplete ? '#fff' : 'var(--c-text-muted, #6b7280)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: isComplete && !validating ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
            marginTop: '8px'
          }}
        >
          {validating ? 'Checking...' : 'Join course'}
        </button>
      </div>

      {enrolledCourses.length > 0 && (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', width: '100%', marginTop: '32px' }}>
          <h3 style={{ color: 'var(--c-text-muted, #9ca3af)', fontSize: '1rem', marginBottom: '16px', borderBottom: '1px solid var(--c-border, #333)', paddingBottom: '8px' }}>My enrolled courses</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {enrolledCourses.map(course => (
              <li key={course.id || course._id}>
                <a
                  href={`/course/${course.id || course._id}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/course/${course.id || course._id}`); }}
                  style={{ color: 'var(--brand-accent, #3b82f6)', textDecoration: 'none', display: 'block', padding: '12px', backgroundColor: 'var(--c-surface, #1e1e1e)', borderRadius: '8px', border: '1px solid var(--c-border, #333)' }}
                >
                  {course.title || course.name || 'Untitled Course'}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
