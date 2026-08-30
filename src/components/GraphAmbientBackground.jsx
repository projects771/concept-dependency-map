import React, { useEffect, useRef } from 'react';
import './GraphAmbientBackground.css';

/**
 * Sits behind the ReactFlow canvas on the concept-graph page. Purely
 * decorative — a faint dot grid plus a soft glow that drifts very slightly
 * with the mouse (rAF-throttled, single listener, no re-renders). Never
 * intercepts pointer events, so graph panning/zooming is unaffected.
 */
export default function GraphAmbientBackground() {
  const glowRef = useRef(null);
  const raf = useRef(null);
  const target = useRef({ x: 0.5, y: 0.4 });

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;

    function onMove(e) {
      target.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const el = glowRef.current;
        if (!el) return;
        el.style.setProperty('--mx', `${target.current.x * 100}%`);
        el.style.setProperty('--my', `${target.current.y * 100}%`);
      });
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="gab" aria-hidden="true">
      <div className="gab-grid" />
      <div className="gab-glow" ref={glowRef} />
    </div>
  );
}
