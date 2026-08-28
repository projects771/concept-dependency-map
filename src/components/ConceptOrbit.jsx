import React from 'react';
import './ConceptOrbit.css';

/**
 * Hero interaction: a central "focus" concept with related concepts
 * orbiting around it, connected by thin lines — communicating
 * "everything you learn is connected" without a generic carousel.
 * Pure CSS animation (two opposing rotations cancel out so each card
 * stays upright), pauses on hover and respects prefers-reduced-motion.
 */

const ORBIT_CONCEPTS = [
  'Arrays', 'Recursion', 'Trees', 'Graphs', 'Sorting', 'Dynamic Programming',
];

export default function ConceptOrbit() {
  const count = ORBIT_CONCEPTS.length;

  return (
    <div className="orbit" role="img" aria-label="Diagram of connected computer-science concepts orbiting a central Data Structures node">
      <div className="orbit-lines" aria-hidden="true">
        {ORBIT_CONCEPTS.map((_, i) => (
          <div key={i} className="orbit-line" style={{ transform: `rotate(${(360 / count) * i}deg)` }} />
        ))}
      </div>

      <div className="orbit-center">
        <span className="orbit-center-glyph">◈</span>
        <span className="orbit-center-label">Data Structures</span>
      </div>

      <div className="orbit-ring">
        {ORBIT_CONCEPTS.map((label, i) => {
          const angle = (360 / count) * i;
          return (
            <div
              key={label}
              className="orbit-slot"
              style={{ transform: `rotate(${angle}deg) translateX(var(--orbit-radius))` }}
            >
              <div className="orbit-card" style={{ '--slot-angle': `${angle}deg`, '--enter-delay': `${i * 0.12}s` }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
