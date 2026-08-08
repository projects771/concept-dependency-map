import React from 'react';
import './SidePanel.css';

const MASTERY_OPTIONS = [
  { value: 'learning',   label: 'Learning',   icon: '◐', color: 'var(--c-learning)',   bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.3)'  },
  { value: 'confident',  label: 'Confident',  icon: '●', color: 'var(--c-confident)',  bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)'  },
  { value: 'struggling', label: 'Struggling', icon: '○', color: 'var(--c-struggling)', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)' },
];

const RISK_COLOR = {
  high:    'var(--c-struggling)',
  medium:  'var(--c-learning)',
  unknown: 'var(--c-text-2)',
  safe:    'var(--c-confident)',
};

/* ── helpers ── */

function isUrl(str) {
  try { return Boolean(new URL(str)); }
  catch { return false; }
}

function getHostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

function ResourceLink({ resource, index }) {
  const isObj = typeof resource === 'object' && resource !== null;
  const url = isObj ? resource.url : (isUrl(resource) ? resource : null);
  const title = isObj ? resource.title : (url ? getHostname(url) : resource);

  if (url) {
    return (
      <li className="sp-resource-item sp-resource-item--link">
        <span className="sp-resource-link-icon" aria-hidden="true">↗</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="sp-resource-link"
          title={url}
        >
          <span className="sp-resource-link-name">{title}</span>
          <span className="sp-resource-link-host t-faint">{url.length > 60 ? url.slice(0, 60) + '…' : url}</span>
        </a>
      </li>
    );
  }
  return (
    <li className="sp-resource-item">
      <span className="sp-resource-dot" aria-hidden="true" />
      <span>{title}</span>
    </li>
  );
}

function PanelHeader({ node, onClose }) {
  return (
    <div className="sp-header">
      <div className="sp-eyebrow t-mono t-faint">Concept · #{node.id.slice(0, 8)}</div>
      <button className="sp-close-btn btn btn-ghost btn-sm" onClick={onClose} aria-label="Close panel">✕</button>
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
          <ResourceLink key={i} resource={r} index={i} />
        ))}
      </ul>
    </section>
  );
}

/* ── Educator panel ── */
function EducatorPanel({ node, onClose, onDelete, onUpdateResources }) {
  const [newTitle, setNewTitle] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

  const handleAddResource = () => {
    if (!newTitle || !newUrl) return;
    const current = Array.isArray(node.data.resources) ? node.data.resources : [];
    onUpdateResources(node.id, [...current, { title: newTitle, url: newUrl }]);
    setNewTitle('');
    setNewUrl('');
  };
  return (
    <>
      <PanelHeader node={node} onClose={onClose} />
      <div className="sp-scroll-area">
        <h2 className="sp-title t-display">{node.data.title}</h2>

        {node.data.description ? (
          <p className="sp-desc">{node.data.description}</p>
        ) : (
          <p className="sp-desc sp-desc--empty">No description added yet.</p>
        )}

        <ResourcesList resources={node.data.resources} />

        <div className="add-resource">
          <input
            className="sp-input"
            placeholder="Resource title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input
            className="sp-input"
            placeholder="URL"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
          />
          <button className="btn btn-sm" onClick={handleAddResource}>Add resource</button>
        </div>

        <section className="sp-section">
          <div className="sp-section-label t-label t-faint">Concept ID</div>
          <div className="sp-meta-value t-mono">#{node.id}</div>
        </section>
      </div>

      <div className="sp-footer">
        <button className="btn btn-danger btn-sm sp-delete-btn" onClick={() => onDelete(node.id)}>
          Remove concept
        </button>
        <p className="sp-footer-hint t-faint">Also removes all connections to this concept.</p>
      </div>
    </>
  );
}

/* ── Student panel ── */
function StudentPanel({ node, onClose, onMasteryChange }) {
  const current = node.data.mastery || 'learning';

  return (
    <>
      <PanelHeader node={node} onClose={onClose} />
      <div className="sp-scroll-area">
        <h2 className="sp-title t-display">{node.data.title}</h2>

        <GapNotice gapRisk={node.data.gapRisk} gapMeta={node.data.gapMeta} />

        {node.data.description && <p className="sp-desc">{node.data.description}</p>}

        {/* mastery — students only */}
        <section className="sp-section">
          <div className="sp-section-label t-label t-faint">Your status</div>
          <div className="sp-mastery" role="group" aria-label="Mastery status">
            {MASTERY_OPTIONS.map((opt) => {
              const active = current === opt.value;
              return (
                <button
                  key={opt.value}
                  className={`sp-mastery-btn ${active ? 'is-active' : ''}`}
                  style={active ? { background: opt.bg, borderColor: opt.border, color: opt.color } : {}}
                  onClick={() => onMasteryChange(node.id, opt.value)}
                  aria-pressed={active}
                >
                  <span style={{ color: active ? opt.color : 'var(--c-text-3)', fontSize: 14 }}>{opt.icon}</span>
                  <span className="sp-mastery-label">{opt.label}</span>
                  {active && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
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

/* ── Main ── */
export default function SidePanel({ node, role, onClose, onMasteryChange, onDelete, onUpdateResources }) {
  const isOpen     = Boolean(node);
  const isEducator = role === 'educator';

  return (
    <>
      {isOpen && <div className="sp-overlay animate-fade-in" onClick={onClose} aria-hidden="true" />}
      <aside className={`sp ${isOpen ? 'sp--open' : ''}`} aria-hidden={!isOpen} role="complementary" aria-label="Concept details">
        {node && (
          isEducator
            ? <EducatorPanel node={node} onClose={onClose} onDelete={onDelete} onUpdateResources={onUpdateResources} />
            : <StudentPanel  node={node} onClose={onClose} onMasteryChange={onMasteryChange} />
        )}
      </aside>
    </>
  );
}
