import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function RoleSelection() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role');

  return (
    <div className="ls-shell">
      <div className="ls-card animate-slide-up">
        <Link to="/" className="ls-back-btn btn btn-ghost btn-sm" style={{ position: 'absolute', top: 20, left: 20 }}>← Home</Link>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </div>
        <h1 className="ls-headline t-display">Welcome.</h1>
        <p className="ls-sub">How are you joining today?</p>

        <div className="ls-roles">
          <Link to="/signin?role=student" className={`ls-role-btn ${defaultRole === 'student' ? 'selected' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="ls-role-icon ls-role-icon--student">◎</span>
            <div className="ls-role-text">
              <div className="ls-role-label">Student</div>
              <div className="ls-role-desc">Explore concepts, track your mastery, navigate the map.</div>
            </div>
            <span className="ls-role-arrow">→</span>
          </Link>

          <Link to="/signin?role=educator" className={`ls-role-btn ${defaultRole === 'educator' ? 'selected' : ''}`} style={{ textDecoration: 'none', color: 'inherit', marginTop: 12 }}>
            <span className="ls-role-icon ls-role-icon--educator">◈</span>
            <div className="ls-role-text">
              <div className="ls-role-label">Educator</div>
              <div className="ls-role-desc">Build concept maps, manage courses, define dependencies.</div>
            </div>
            <span className="ls-role-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
