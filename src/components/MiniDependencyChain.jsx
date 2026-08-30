import React, { useEffect, useState } from 'react';
import './MiniDependencyChain.css';

/**
 * A small vertical chain of concept nodes connected by arrows, used to
 * visually demonstrate "concept A depends on concept B". When `weakIndex`
 * is set, that node is shown as struggling and every node downstream of
 * it (visually below) is flagged as at-risk — demonstrating how a single
 * weak prerequisite propagates forward.
 *
 * With no `weakIndex`, the chain gently auto-cycles which node is
 * "active" to suggest live data flow, pausing under prefers-reduced-motion.
 */
export default function MiniDependencyChain({ items, weakIndex = null, direction = 'down' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoCycle = weakIndex === null;

  useEffect(() => {
    if (!autoCycle) return undefined;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, 1600);
    return () => clearInterval(id);
  }, [autoCycle, items.length]);

  return (
    <div className={`mdc mdc--${direction}`}>
      {items.map((label, i) => {
        const isWeak = weakIndex === i;
        const isAtRisk = weakIndex !== null && i > weakIndex;
        const isActive = autoCycle && activeIndex === i;
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div className={`mdc-arrow ${isAtRisk ? 'mdc-arrow--risk' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 3v15M12 18l-5-5M12 18l5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div
              className={[
                'mdc-node',
                isWeak ? 'mdc-node--weak' : '',
                isAtRisk ? 'mdc-node--risk' : '',
                isActive ? 'mdc-node--active' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="mdc-node-dot" />
              <span className="mdc-node-label">{label}</span>
              {isWeak && <span className="mdc-node-tag">struggling</span>}
              {isAtRisk && <span className="mdc-node-tag mdc-node-tag--risk">at risk</span>}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
