import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useRole } from '../context/RoleContext.jsx';
import './ConceptNode.css';

const MASTERY_CONFIG = {
  confident:  { label: 'Confident',  dot: 'var(--c-confident)', dim: 'rgba(52,211,153,0.12)'  },
  learning:   { label: 'Learning',   dot: 'var(--c-learning)',  dim: 'rgba(251,191,36,0.12)'  },
  struggling: { label: 'Struggling', dot: 'var(--c-struggling)',dim: 'rgba(248,113,113,0.12)' },
};

const RISK_BADGE = {
  high:    '⚠ high risk',
  medium:  '⚠ medium risk',
  unknown: '⚠ gap risk',
  safe:    null,
};

// Neutral config shown to educators — no colour, no label
const NEUTRAL = { dot: 'var(--c-text-3)', dim: 'rgba(90,90,104,0.10)' };

function ConceptNode({ data, selected }) {
  const { role } = useRole();
  const isEducator = role === 'educator';

  const mastery   = data.mastery || 'learning';
  const cfg       = isEducator ? NEUTRAL : (MASTERY_CONFIG[mastery] ?? MASTERY_CONFIG.learning);
  const riskKey   = data.gapMeta?.risk ?? (data.gapRisk ? 'unknown' : null);
  const badgeText = (!isEducator && riskKey) ? (RISK_BADGE[riskKey] ?? '⚠ gap risk') : null;
  const isRisk    = Boolean(badgeText) && riskKey !== 'safe';

  return (
    <div
      className={[
        'cn',
        isEducator ? 'cn--educator' : `cn--${mastery}`,
        selected ? 'cn--selected' : '',
        isRisk    ? `cn--risk-${riskKey}` : '',
      ].filter(Boolean).join(' ')}
      style={{ '--mastery-dot': cfg.dot, '--mastery-dim': cfg.dim }}
    >
      <Handle type="target" position={Position.Top}  className="cn-handle cn-handle--target" />

      {badgeText && (
        <div className="cn-risk-badge t-mono">{badgeText}</div>
      )}

      {/* status dot — hidden for educators */}
      {!isEducator && <div className="cn-dot" aria-hidden="true" />}

      <div className="cn-body">
        <div className="cn-title">{data.title}</div>
        {/* mastery label — hidden for educators */}
        {!isEducator && (
          <div className="cn-status t-mono">{MASTERY_CONFIG[mastery]?.label}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="cn-handle cn-handle--source" />
    </div>
  );
}

export default memo(ConceptNode);
