import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import '../LandingScreen.css'; // Re-use existing styles

export default function LandingPage() {
  return (
    <div className="ls-shell">
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/join" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/join" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </header>

      <div className="ls-card animate-slide-up" style={{ textAlign: 'center', marginTop: 80, padding: '60px 40px', maxWidth: 800 }}>
        <h1 className="t-display" style={{ fontSize: '3rem', marginBottom: 24 }}>
          See why you're stuck, <br/>not just where.
        </h1>
        <p className="ls-sub" style={{ fontSize: '1.2rem', maxWidth: 500, margin: '0 auto 40px' }}>
          Nodemap maps your course concepts as a dependency graph. Master the fundamentals before unlocking advanced topics.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/join?role=educator" className="btn btn-secondary">I'm an educator</Link>
          <Link to="/join?role=student" className="btn btn-primary">I'm a student</Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 40, maxWidth: 900 }}>
        <div className="ls-card" style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 8 }}>Dependency Graph</h3>
          <p className="t-faint">Visualize exactly how concepts connect and build upon one another.</p>
        </div>
        <div className="ls-card" style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 8 }}>Gap Highlighter</h3>
          <p className="t-faint">Instantly see which downstream topics are at risk when you struggle.</p>
        </div>
        <div className="ls-card" style={{ flex: 1 }}>
          <h3 style={{ marginBottom: 8 }}>Class Analytics</h3>
          <p className="t-faint">Educators can track class-wide mastery and identify widespread gaps.</p>
        </div>
      </div>
    </div>
  );
}
