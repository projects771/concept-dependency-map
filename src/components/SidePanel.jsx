import React from 'react';
import './SidePanel.css';

/* ── mastery options (students only) ── */
const MASTERY_OPTIONS = [
  {
    value: 'learning',
    label: 'Learning',
    icon:  '◐',
    hint:  'Still working through this concept',
    color: 'var(--c-learning)',
    bg:    'rgba(251,191,36,0.08)',
    border:'rgba(251,191,36,0.3)',
  },
  {
    value: 'confident',
    label: 'Confident',
    icon:  '●',
    hint:  'Got it — feeling solid on this',
    color: 'var(--c-confident)',
    bg:    'rgba(52,211,153,0.08)',
    border:'rgba(52,211,153,0.3)',
  },
  {
    value: 'struggling',
    label: 'Struggling',
    icon:  '○',
    hint:  'Need to revisit — not clicking yet',
    color: 'var(--c-struggling)',
    bg:    'rgba(248,113,113,0.08)',
    border:'rgba(248,113,113,0.3)',
  },
];

const RISK_COLOR = {
  high:    'var(--c-struggling)',
  medium:  'var(--c-learning)',
  unknown: 'var(--c-text-2)',
  safe:    'var(--c-confident)',
};

/* ── shared sub-components ── */
function PanelHeader({ node, onClose }) {
  return (
    <div className="sp-header">
      <div className="sp-eyebrow t-mono t-faint">Concept · #{node.id}</div>
      <button
        className="sp-close-btn btn btn-ghost btn-sm"
        onClick={onClose}
        aria-label="Close panel"
      >
        ✕
      </button>
    </div>
  );
}

function GapNotice({ gapRisk, gapMeta }) {
  if (!gapRisk) return null;
  return (
    <div className="sp-gap-notice animate-fade-in">
      <div className="sp-gap-header">
        <span>⚠ Downstream gap risk</span>
        {gapMeta && (
          <span className="sp-gap-badge t-mono" style={{ color: RISK_COLOR[gapMeta.risk] }}>
            {gapMeta.risk} risk
          </span>
        )}
      </div>
      <p className="sp-gap-body">
        {gapMeta
          ? `${gapMeta.distance} step${gapMeta.distance !== 1 ? 's' : ''} downstream of a struggling prerequisite.`
          : 'A prerequisite further back still needs work.'}
      </p>
    </div>
  );
}

function ResourcesList({ resources }) {
  if (!resources?.length) return null;
  return (
    <section className="sp-section">
      <div className="sp-section-label t-label t-faint">Resources</div>
      <ul className="sp-resources">
        {resources.map((r, i) => (
          <li key={i} className="sp-resource-item">
            <span className="sp-resource-dot" aria-hidden="true" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Educator panel ── */
function EducatorPanel({ node, onClose, onDelete }) {
  return (
    <>
      <PanelHeader node={node} onClose={onClose} />

      {/* scrollable content area */}
      <div className="sp-scroll-area">
        <h2 className="sp-title t-display">{node.data.title}</h2>

        {node.data.description ? (
          <p className="sp-desc">{node.data.description}</p>
        ) : (
          <p className="sp-desc sp-desc--empty">No description added yet.</p>
        )}

        <ResourcesList resources={node.data.resources} />

        {/* concept metadata */}
        <section className="sp-section">
          <div className="sp-section-label t-label t-faint">Concept ID</div>
          <div className="sp-meta-value t-mono">#{node.id}</div>
        </section>
      </div>

      {/* fixed action footer */}
      <div className="sp-footer">
        <button
          className="btn btn-danger btn-sm sp-delete-btn"
          onClick={() => onDelete(node.id)}
        >
          Remove concept
        </button>
        <p className="sp-footer-hint t-faint">
          This will also remove all connections to this concept.
        </p>
      </div>
    </>
  );
}

/* ── Student panel ── */
function StudentPanel({ node, onClose, onMasteryChange }) {
  const currentMastery = node.data.mastery || 'learning';

  return (
    <>
      <PanelHeader node={node} onClose={onClose} />

      {/* scrollable content area */}
      <div className="sp-scroll-area">
        <h2 className="sp-title t-display">{node.data.title}</h2>

        <GapNotice gapRisk={node.data.gapRisk} gapMeta={node.data.gapMeta} />

        {node.data.description && (
          <p className="sp-desc">{node.data.description}</p>
        )}

        {/* mastery section — students only */}
        <section className="sp-section">
          <div className="sp-section-label t-label t-faint">Your status</div>
          <div className="sp-mastery" role="group" aria-label="Set your mastery status">
            {MASTERY_OPTIONS.map((opt) => {
              const isActive = currentMastery === opt.value;
              return (
                <button
                  key={opt.value}
                  className={`sp-mastery-btn ${isActive ? 'is-active' : ''}`}
                  style={isActive ? {
                    background:   opt.bg,
                    borderColor:  opt.border,
                    color:        opt.color,
                  } : {}}
                  onClick={() => onMasteryChange(node.id, opt.value)}
                  title={opt.hint}
                  aria-pressed={isActive}
                >
                  <span className="sp-mastery-icon" style={{ color: isActive ? opt.color : 'var(--c-text-3)' }}>
                    {opt.icon}
                  </span>
                  <span className="sp-mastery-label">{opt.label}</span>
                  {isActive && <span className="sp-mastery-check">✓</span>}
                </button>
              );
            })}
          </div>
        </section>

        <ResourcesList resources={node.data.resources} />
      </div>
    </>
  );
}

/* ── Main export ── */
export default function SidePanel({ node, role, onClose, onMasteryChange, onDelete }) {
  const isOpen     = Boolean(node);
  const isEducator = role === 'educator';

  return (
    <>
      {isOpen && (
        <div
          className="sp-overlay animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sp ${isOpen ? 'sp--open' : ''}`}
        aria-label="Concept details"
        aria-hidden={!isOpen}
        role="complementary"
      >
        {node && (
          isEducator
            ? <EducatorPanel node={node} onClose={onClose} onDelete={onDelete} />
            : <StudentPanel  node={node} onClose={onClose} onMasteryChange={onMasteryChange} />
        )}
      </aside>
    </>
  );
}
