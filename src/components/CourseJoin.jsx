import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import GraphBackground from './GraphBackground.jsx';
import CourseCarousel from './CourseCarousel.jsx';
import './CourseJoin.css';

const ENROLLED_CACHE_KEY = 'enrolled_courses';

function readCachedCourses() {
  try {
    const raw = JSON.parse(localStorage.getItem(ENROLLED_CACHE_KEY) || '[]');
    // Support both the old cache format (array of ids) and the new format
    // (array of course objects) so we don't break on an existing cache.
    return raw.map((entry) => (typeof entry === 'object' ? entry : { id: entry }));
  } catch {
    return [];
  }
}

function writeCachedCourses(courses) {
  try {
    localStorage.setItem(ENROLLED_CACHE_KEY, JSON.stringify(courses));
  } catch {
    /* localStorage unavailable — fail silently, it's only a UI fallback */
  }
}

function dedupeCourses(courses) {
  const seen = new Map();
  courses.forEach((c) => {
    const id = c.id || c._id;
    if (id && !seen.has(id)) seen.set(id, c);
  });
  return Array.from(seen.values());
}

// Turn a raw backend/network error into something safe to show a student.
function friendlyJoinError(err) {
  if (!err || err.status === 0) return "Can't reach the server. Check your connection and try again.";
  if (err.status === 404) return "That course code doesn't match any course.";
  if (err.status === 409) return "You're already enrolled in this course.";
  if (err.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return err.message && err.message.length < 100
    ? err.message
    : 'Invalid course code or error joining. Please double-check the code.';
}

export default function CourseJoin() {
  const [chars, setChars] = useState(['', '', '', '', '', '']);
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [validating, setValidating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState(() => readCachedCourses());
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Cached courses render immediately (see useState above) so the list
    // never looks empty for a moment; this reconciles with the server,
    // which remains the source of truth.
    const loadCourses = async () => {
      setCoursesLoading(true);
      setCoursesError(false);
      let courses = null;
      try {
        const res = await api.fetchEnrolledCourses();
        courses = res?.courses || [];
      } catch (err) {
        // Dedicated endpoint may not exist yet on the backend — fall back
        // to the general courses list rather than showing nothing.
        try {
          const res = await api.fetchCourses();
          courses = res?.courses || [];
        } catch (err2) {
          console.error('Error fetching enrolled courses:', err2);
          setCoursesError(true);
        }
      }
      if (courses) {
        const merged = dedupeCourses([...readCachedCourses(), ...courses]);
        setEnrolledCourses(merged);
        writeCachedCourses(merged);
      }
      setCoursesLoading(false);
    };
    if (user) loadCourses();
    else setCoursesLoading(false);
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
      const courseId = response?.courseId || response?.id || response?._id;
      if (response && courseId) {
        // Cache immediately so it shows up in "My enrolled courses" even
        // before the next server round-trip — the join call itself already
        // confirmed persistence server-side.
        const cached = dedupeCourses([
          ...readCachedCourses(),
          { id: courseId, title: response.title || response.course?.title, courseCode },
        ]);
        writeCachedCourses(cached);
        setEnrolledCourses(cached);
        toast.success('Successfully joined course!');
        navigate(`/course/${courseId}`);
      } else {
        setLocalError('Failed to join course. Please try again.');
      }
    } catch (err) {
      setLocalError(friendlyJoinError(err));
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="ls-shell cj-shell">
      <GraphBackground />
      <div className="cj-container">
        <div className="ls-card cj-join-card animate-slide-up">
          <div className="cj-icon">🔗</div>
          <h2 className="cj-title">Enter your course code</h2>
          <p className="cj-sub">Your educator shared a 6-character code to join their course map</p>

          <div className="cj-code-row">
            {chars.map((char, index) => (
              <input
                key={index}
                ref={refs[index]}
                type="text"
                value={char}
                className="cj-code-input"
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          {localError && <div className="cj-error">{localError}</div>}

          <button
            onClick={handleJoin}
            disabled={!isComplete || validating}
            className="btn btn-primary cj-join-btn"
          >
            {validating ? 'Checking…' : 'Join course'}
          </button>
        </div>

        <div className="cj-enrolled">
          <h3 className="cj-enrolled-title">My enrolled courses</h3>

          {coursesLoading && enrolledCourses.length === 0 ? (
            <div className="cj-skeleton-list">
              {[0, 1].map((i) => <div key={i} className="cj-skeleton-card" />)}
            </div>
          ) : enrolledCourses.length > 0 ? (
            <>
              <CourseCarousel
                courses={enrolledCourses}
                actionLabel="Open course →"
                onOpen={(course) => navigate(`/course/${course.id || course._id}`)}
                renderMeta={(course) => (
                  <>
                    {course.courseCode && <span className="cj-course-code t-mono">{course.courseCode}</span>}
                    {typeof course.conceptCount === 'number' && (
                      <span>{course.conceptCount} concept{course.conceptCount !== 1 ? 's' : ''}</span>
                    )}
                  </>
                )}
              />
              {coursesError && (
                <div className="cj-inline-warning">
                  Showing your last known courses — couldn't reach the server to refresh this list.
                </div>
              )}
            </>
          ) : coursesError ? (
            <div className="cj-empty cj-empty--error">
              <div className="cj-empty-icon">⚠</div>
              <div className="cj-empty-title">Couldn't load your courses</div>
              <div className="cj-empty-sub">Check your connection and refresh the page to try again.</div>
            </div>
          ) : (
            <div className="cj-empty">
              <div className="cj-empty-icon">◈</div>
              <div className="cj-empty-title">No courses yet</div>
              <div className="cj-empty-sub">Join a course using your course code above to start learning.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
