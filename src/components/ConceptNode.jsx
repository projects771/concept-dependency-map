import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './ConceptNode.css';

const MASTERY_LABEL = {
  confident:  'Confident',
  learning:   'Learning',
  struggling: 'Struggling',
};

// Badge text + node border colour driven by risk level from the gap API
const RISK_BADGE = {
  high:    '⚠️ high risk',
  medium:  '⚠️ medium risk',
  unknown: '⚠️ gap risk',
  safe:    null,           // safe = don't badge at all
};

function ConceptNode({ id, data, selected }) {
  const mastery  = data.mastery  || 'learning';
  const riskKey  = data.gapMeta?.risk ?? (data.gapRisk ? 'unknown' : null);
  const badgeText = riskKey ? (RISK_BADGE[riskKey] ?? '⚠️ gap risk') : null;

  return (
    <div
      className={[
        'concept-node',
        `mastery-${mastery}`,
        selected    ? 'is-selected'  : '',
        data.gapRisk ? 'has-gap-risk' : '',
        riskKey     ? `risk-${riskKey}` : '',
      ].filter(Boolean).join(' ')}
    >
      <Handle type="target" position={Position.Left} className="concept-handle" />

      {badgeText && (
        <div className="gap-badge" title="This concept is downstream of an unresolved gap">
          {badgeText}
        </div>
      )}

      <div className="concept-marker">
        <span className="concept-marker-dot" aria-hidden="true" />
      </div>

      <div className="concept-body">
        <div className="concept-id font-mono">#{id}</div>
        <div className="concept-title font-display">{data.title}</div>
        <div className="concept-status font-mono">{MASTERY_LABEL[mastery]}</div>
      </div>

      <Handle type="source" position={Position.Right} className="concept-handle" />
    </div>
  );
}

export default memo(ConceptNode);
