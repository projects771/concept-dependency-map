import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import GraphBackground from './GraphBackground.jsx';
import ConceptOrbit from './ConceptOrbit.jsx';
import './LandingPage.css';

const FEATURES = [
  {
    glyph: '❖',
    tone: 'accent',
    title: 'Dependency graph',
    desc: 'A visual map of how every concept in a course connects to the next — see the structure, not just a list of topics.',
  },
  {
    glyph: '⚠',
    tone: 'warning',
    title: 'Gap highlighter',
    desc: 'When you struggle with a concept, Nodemap traces the downstream risk to everything that depends on it.',
  },
  {
    glyph: '◈',
    tone: 'info',
    title: 'Class analytics',
    desc: 'Educators see exactly where the whole class is weak, in one view — no digging through spreadsheets.',
  },
];

export default function LandingPage() {
  return (
    <div className="lp-shell">
      <GraphBackground />

      {/* Navbar */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <Logo />
          <div className="lp-nav-actions">
            <Link to="/join" className="btn btn-ghost">Sign in</Link>
            <Link to="/join" className="btn btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow">Knowledge dependency mapping</div>

          <h1 className="t-display lp-headline">
            See why you're stuck,<br />not just where
          </h1>

          <p className="lp-sub">
            Nodemap maps your course as a knowledge graph. Students see which
            gaps are blocking their progress. Educators spot class-wide
            weaknesses in one view.
          </p>

          <div className="lp-cta-row">
            <Link to="/join?role=educator" className="btn btn-primary lp-cta">
              <span>◈</span> I'm an educator
            </Link>
            <Link to="/join?role=student" className="btn btn-secondary lp-cta">
              <span>◎</span> I'm a student
            </Link>
          </div>
        </div>

        <div className="lp-hero-visual">
          <ConceptOrbit />
        </div>
      </main>

      {/* Feature cards */}
      <section className="lp-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="lp-feature-card">
            <div className={`lp-feature-glyph lp-feature-glyph--${f.tone}`}>{f.glyph}</div>
            <h3 className="lp-feature-title">{f.title}</h3>
            <p className="lp-feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="lp-footer">
        <span className="t-faint">Nodemap — every concept, connected.</span>
      </footer>
    </div>
  );
}
