import React from 'react';
import './SidePanel.css';

const MASTERY_OPTIONS = [
  { value: 'learning',   label: '◐ Learning',   hint: 'Still working through this' },
  { value: 'confident',  label: '● Confident',   hint: 'Got it — feeling solid'    },
  { value: 'struggling', label: '○ Struggling',  hint: 'Need to revisit this'      },
];

const RISK_COLOR = {
  high:    'var(--c-struggling)',
  medium:  'var(--c-learning)',
  unknown: 'var(--c-text-2)',
  safe:    'var(--c-confident)',
};

export default function SidePanel({ node, mode, onClose, onMasteryChange, onDelete }) {
  const isOpen = Boolean(node);

  return (
    <>
      {isOpen && <div className="sp-overlay" onClick={onClose} />}
      <aside className={`sp ${isOpen ? 'sp--open' : ''}`} aria-hidden={!isOpen}>
        {node && (
          <>
            <div className="sp-header">
              <div className="sp-eyebrow t-mono t-faint">Concept · #{node.id}</div>
              <button className="btn btn-ghost btn-sm sp-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <h2 className="sp-title t-display">{node.data.title}</h2>

            {/* gap risk notice */}
            {node.data.gapRisk && (
              <div className="sp-gap-notice animate-fade-in">
                <div className="sp-gap-header">
                  <span>⚠ Downstream gap risk</span>
                  {node.data.gapMeta && (
                    <span className="sp-gap-badge t-mono" style={{ color: RISK_COLOR[node.data.gapMeta.risk] }}>
                      {node.data.gapMeta.risk} risk
                    </span>
                  )}
                </div>
                <p className="sp-gap-body">
                  {node.data.gapMeta
                    ? `${node.data.gapMeta.distance} step${node.data.gapMeta.distance !== 1 ? 's' : ''} downstream of a struggling prerequisite.`
                    : 'A prerequisite further back still needs work.'}
                </p>
              </div>
            )}

            {/* description */}
            {node.data.description && (
              <p className="sp-desc">{node.data.description}</p>
            )}

            {/* resources */}
            {node.data.resources?.length > 0 && (
              <section className="sp-section">
                <div className="sp-section-label t-label t-faint">Resources</div>
                <ul className="sp-resources">
                  {node.data.resources.map((r, i) => (
                    <li key={i} className="sp-resource-item">
                      <span className="sp-resource-dot" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* mastery */}
            <section className="sp-section">
              <div className="sp-section-label t-label t-faint">Your status</div>
              <div className="sp-mastery" role="group" aria-label="Mastery status">
                {MASTERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`sp-mastery-btn sp-mastery-${opt.value} ${node.data.mastery === opt.value ? 'is-active' : ''}`}
                    onClick={() => onMasteryChange(node.id, opt.value)}
                    title={opt.hint}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            {/* educator delete */}
            {mode === 'educator' && (
              <button className="btn btn-danger btn-sm sp-delete" onClick={() => onDelete(node.id)}>
                Remove concept
              </button>
            )}
          </>
        )}
      </aside>
    </>
  );
}
