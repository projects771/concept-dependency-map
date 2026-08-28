import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import GraphBackground from './GraphBackground.jsx';
import './RoleSelection.css';

const EDUCATOR_HINTS = ['Courses', 'Class analytics', 'Knowledge graphs', 'Dependencies'];
const STUDENT_HINTS   = ['Learning paths', 'Concept mastery', 'Knowledge gaps', 'Dependencies'];

export default function RoleSelection() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'student' ? 'student' : 'educator';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [hovered, setHovered] = useState(null);

  const isEducator = selectedRole === 'educator';
  const isStudent = selectedRole === 'student';

  return (
    <div className="ls-shell">
      <GraphBackground />
      <div className="rs-container animate-slide-up">
        <div className="rs-step t-mono">Step 1 of 2</div>
        <h1 className="t-display rs-heading">How will you use Nodemap?</h1>
        <p className="rs-subtext">You can always switch later</p>

        <div className="rs-cards">
          <button
            type="button"
            className={`rs-card ${isEducator ? 'rs-card--selected' : ''}`}
            onClick={() => setSelectedRole('educator')}
            onMouseEnter={() => setHovered('educator')}
            onMouseLeave={() => setHovered(null)}
          >
            {isEducator && <div className="rs-badge">Selected</div>}
            <div className="rs-icon">🎓</div>
            <div className="rs-card-title">Educator</div>
            <div className="rs-card-desc">Build course maps and track class progress</div>
            <div className={`rs-hints ${hovered === 'educator' || isEducator ? 'rs-hints--visible' : ''}`}>
              {EDUCATOR_HINTS.map((h, i) => (
                <span key={h} className="rs-hint-pill" style={{ transitionDelay: `${i * 40}ms` }}>{h}</span>
              ))}
            </div>
          </button>

          <button
            type="button"
            className={`rs-card ${isStudent ? 'rs-card--selected' : ''}`}
            onClick={() => setSelectedRole('student')}
            onMouseEnter={() => setHovered('student')}
            onMouseLeave={() => setHovered(null)}
          >
            {isStudent && <div className="rs-badge">Selected</div>}
            <div className="rs-icon">📖</div>
            <div className="rs-card-title">Student</div>
            <div className="rs-card-desc">Track your mastery and find knowledge gaps</div>
            <div className={`rs-hints ${hovered === 'student' || isStudent ? 'rs-hints--visible' : ''}`}>
              {STUDENT_HINTS.map((h, i) => (
                <span key={h} className="rs-hint-pill" style={{ transitionDelay: `${i * 40}ms` }}>{h}</span>
              ))}
            </div>
          </button>
        </div>

        <Link to={`/signin?role=${selectedRole}`} className="btn btn-primary btn-lg rs-continue">
          Continue as {selectedRole} →
        </Link>
      </div>
    </div>
  );
}
