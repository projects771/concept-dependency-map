import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import GraphBackground from './GraphBackground.jsx';
import ConceptOrbit from './ConceptOrbit.jsx';
import MiniDependencyChain from './MiniDependencyChain.jsx';
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

const HOW_IT_WORKS = [
  { n: '01', title: 'Map', desc: 'Turn a course into a connected concept map, with prerequisites defined between topics.' },
  { n: '02', title: 'Learn', desc: 'Students explore concepts in context, seeing exactly what each one depends on.' },
  { n: '03', title: 'Identify gaps', desc: 'Nodemap highlights concepts that may be quietly blocking progress downstream.' },
  { n: '04', title: 'Improve', desc: 'Students know what to learn next. Educators know exactly where the class needs support.' },
];

const STUDENT_POINTS = [
  'View every concept as a connected map, not a flat list',
  'Understand prerequisites before getting stuck on what comes next',
  'Identify knowledge gaps early, before they compound',
  'Track concept mastery as you learn',
  'See the downstream effects of a missing concept',
  'Follow a clearer, more deliberate learning path',
];

const EDUCATOR_POINTS = [
  'Build course concept maps and define dependencies visually',
  'Share courses with students via a simple join code',
  'Monitor class-wide progress in one view',
  'Identify common knowledge gaps across the whole class',
  'See which concepts need additional teaching attention',
  'Use the dependency graph itself to guide what to teach next',
];

const CLASS_HEATMAP = [
  { label: 'Arrays', tone: 'confident' },
  { label: 'Recursion', tone: 'learning' },
  { label: 'Trees', tone: 'learning' },
  { label: 'Graphs', tone: 'struggling' },
  { label: 'Sorting', tone: 'confident' },
  { label: 'DP', tone: 'struggling' },
];

const CREATORS = [
  { name: 'Nawal Kishore S Pai', email: 'nawalkishoresatishpai@gmail.com', role: 'Creator / Developer' },
  { name: 'Gokul B', email: 'gokulb7776@gmail.com', role: 'Creator / Developer' },
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
            Nodemap is an interactive knowledge-dependency platform: it maps a
            course as a connected graph, so students see exactly which gaps
            are blocking their progress, and educators spot class-wide
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

      {/* What is Nodemap */}
      <section className="lp-section lp-what">
        <div className="lp-section-head">
          <div className="t-label lp-kicker">What is Nodemap?</div>
          <h2 className="t-display lp-section-title">
            Not "right or wrong" — <span className="lp-accent-text">why</span>
          </h2>
          <p className="lp-section-lead">
            Most platforms tell you whether you got something right. Nodemap
            represents a course as a connected knowledge graph, so it can tell
            you which concepts you understand, which you're struggling with,
            which prerequisites are missing, and which gaps are quietly
            blocking the concepts that come next.
          </p>
        </div>
      </section>

      {/* How Nodemap works */}
      <section className="lp-section lp-how">
        <div className="lp-section-head lp-section-head--center">
          <div className="t-label lp-kicker">How Nodemap works</div>
          <h2 className="t-display lp-section-title">From course to knowledge map</h2>
        </div>

        <div className="lp-steps">
          {HOW_IT_WORKS.map((step, i) => (
            <React.Fragment key={step.n}>
              <div className="lp-step">
                <div className="lp-step-number t-mono">{step.n}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
              {i < HOW_IT_WORKS.length - 1 && <div className="lp-step-connector" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* For students */}
      <section className="lp-section lp-audience">
        <div className="lp-audience-copy">
          <div className="t-label lp-kicker">For students</div>
          <h2 className="t-display lp-section-title">Understand what's holding you back</h2>
          <ul className="lp-point-list">
            {STUDENT_POINTS.map((p) => (
              <li key={p}><span className="lp-point-dot" />{p}</li>
            ))}
          </ul>
        </div>
        <div className="lp-audience-visual">
          <MiniDependencyChain items={['Arrays', 'Searching', 'Graphs', 'Algorithms']} />
        </div>
      </section>

      {/* For educators */}
      <section className="lp-section lp-audience lp-audience--reverse">
        <div className="lp-audience-visual">
          <div className="lp-heatmap">
            {CLASS_HEATMAP.map((c) => (
              <div key={c.label} className={`lp-heatmap-chip lp-heatmap-chip--${c.tone}`}>
                <span className="lp-heatmap-dot" />
                {c.label}
              </div>
            ))}
          </div>
          <div className="t-faint lp-heatmap-caption">Class mastery, at a glance</div>
        </div>
        <div className="lp-audience-copy">
          <div className="t-label lp-kicker">For educators</div>
          <h2 className="t-display lp-section-title">See where your entire class is struggling</h2>
          <ul className="lp-point-list">
            {EDUCATOR_POINTS.map((p) => (
              <li key={p}><span className="lp-point-dot lp-point-dot--info" />{p}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* About Nodemap — the storytelling section */}
      <section className="lp-section lp-about">
        <div className="lp-about-copy">
          <div className="t-label lp-kicker">About Nodemap</div>
          <h2 className="t-display lp-section-title">Traditional progress tracking stops too early</h2>
          <p className="lp-section-lead">
            "Completed / Not completed." "Score: 75%." Traditional tools stop
            there. Nodemap asks the next question: <em>why</em> is the student
            struggling? If someone is stuck on Graph Algorithms, the real
            problem might not be Graph Algorithms at all — it might trace all
            the way back to a shaky foundation in Data Structures.
          </p>
          <p className="lp-section-lead">
            Nodemap visualizes that chain of dependencies so the actual source
            of a learning gap becomes obvious, instead of guesswork.
          </p>
        </div>
        <div className="lp-about-visual">
          <MiniDependencyChain
            items={['Data Structures', 'Recursion', 'Trees', 'Graph Theory', 'Graph Algorithms']}
            weakIndex={0}
          />
        </div>
      </section>

      {/* Creators / contact */}
      <section className="lp-section lp-creators">
        <div className="lp-section-head lp-section-head--center">
          <div className="t-label lp-kicker">Built by</div>
          <h2 className="t-display lp-section-title">Meet the creators</h2>
        </div>
        <div className="lp-creator-cards">
          {CREATORS.map((c) => (
            <a key={c.email} href={`mailto:${c.email}`} className="lp-creator-card">
              <span className="lp-creator-icon">✉</span>
              <span className="lp-creator-info">
                <span className="lp-creator-name">{c.name}</span>
                <span className="lp-creator-email">{c.email}</span>
                <span className="lp-creator-role t-faint">{c.role}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <footer className="lp-footer">
        <span className="t-faint">Nodemap — every concept, connected.</span>
      </footer>
    </div>
  );
}
