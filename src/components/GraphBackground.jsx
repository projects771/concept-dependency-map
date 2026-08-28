import React, { useMemo } from 'react';
import './GraphBackground.css';

/**
 * Subtle animated knowledge-graph backdrop.
 * Renders a static field of drifting nodes + connecting lines,
 * with a couple of light "pulses" travelling along a few edges to
 * suggest live dependency traffic. Pure CSS/SVG — no animation loop,
 * so it's cheap to mount behind any full-screen view.
 *
 * Usage: <GraphBackground /> as the first child of a `position: relative`
 * (or fixed) full-bleed container. It positions itself absolutely and
 * never intercepts pointer events.
 */

const NODES = [
  { id: 'n1', x: 90,  y: 120, r: 5, delay: '0s' },
  { id: 'n2', x: 260, y: 60,  r: 3.5, delay: '-2s' },
  { id: 'n3', x: 210, y: 260, r: 4, delay: '-5s' },
  { id: 'n4', x: 420, y: 150, r: 6, delay: '-1s' },
  { id: 'n5', x: 520, y: 320, r: 3.5, delay: '-4s' },
  { id: 'n6', x: 650, y: 90,  r: 4.5, delay: '-3s' },
  { id: 'n7', x: 780, y: 240, r: 5, delay: '-6s' },
  { id: 'n8', x: 900, y: 110, r: 3.5, delay: '-2.5s' },
  { id: 'n9', x: 60,  y: 400, r: 4, delay: '-3.5s' },
  { id: 'n10', x: 330, y: 440, r: 5, delay: '-1.5s' },
  { id: 'n11', x: 600, y: 480, r: 3.5, delay: '-4.5s' },
  { id: 'n12', x: 860, y: 420, r: 4.5, delay: '-0.5s' },
  { id: 'n13', x: 980, y: 340, r: 3.5, delay: '-5.5s' },
  { id: 'n14', x: 150, y: 560, r: 4, delay: '-2.2s' },
  { id: 'n15', x: 470, y: 600, r: 3.5, delay: '-3.8s' },
  { id: 'n16', x: 730, y: 590, r: 5, delay: '-1.2s' },
];

const EDGES = [
  ['n1', 'n2'], ['n1', 'n3'], ['n2', 'n4'], ['n3', 'n4'], ['n4', 'n6'],
  ['n6', 'n7'], ['n6', 'n8'], ['n7', 'n12'], ['n5', 'n4'], ['n5', 'n10'],
  ['n9', 'n1'], ['n9', 'n14'], ['n10', 'n14'], ['n10', 'n15'], ['n11', 'n15'],
  ['n11', 'n16'], ['n12', 'n16'], ['n12', 'n13'], ['n3', 'n9'], ['n7', 'n13'],
];

// A handful of edges get a travelling "pulse" to suggest live data flow.
const PULSE_EDGES = [0, 4, 9, 13, 17];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

export default function GraphBackground({ className = '' }) {
  const paths = useMemo(
    () => EDGES.map(([a, b], i) => {
      const p1 = byId[a];
      const p2 = byId[b];
      return { id: `e${i}`, d: `M${p1.x},${p1.y} L${p2.x},${p2.y}`, pulse: PULSE_EDGES.includes(i) };
    }),
    []
  );

  return (
    <div className={`gbg ${className}`} aria-hidden="true">
      <svg className="gbg-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="gbg-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="gbg-edges">
          {paths.map((p) => (
            <path key={p.id} id={p.id} d={p.d} className="gbg-edge" />
          ))}
        </g>

        <g className="gbg-pulses">
          {paths.filter((p) => p.pulse).map((p) => (
            <circle key={`pulse-${p.id}`} r="2.4" className="gbg-pulse-dot" fill="var(--brand-light)">
              <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
                <mpath href={`#${p.id}`} />
              </animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="6s" repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        <g className="gbg-nodes">
          {NODES.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
              <g className="gbg-node" style={{ animationDelay: n.delay }}>
                <circle r={n.r * 3.2} fill="url(#gbg-node-glow)" className="gbg-node-glow" />
                <circle r={n.r} className="gbg-node-dot" />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
