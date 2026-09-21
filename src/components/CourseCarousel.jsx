import React, { useCallback, useEffect, useRef, useState } from 'react';
import './CourseCarousel.css';

/**
 * Animated "coverflow" course selector, shared by the student and educator
 * dashboards. Presentation only — it never fetches, navigates, or knows
 * anything about roles. The parent owns the data and supplies:
 *
 *   courses      – array of course objects (must have a stable id)
 *   onOpen(c)    – called when the focused card's primary action fires
 *   actionLabel  – text for that primary action ("Open course", "Edit Graph →")
 *   renderMeta   – optional (course) => ReactNode, rendered under the title,
 *                  so each dashboard can show its own role-specific details
 *                  (share code + enrollment count vs. concept count)
 *
 * Clicking a side card focuses it; clicking the focused card opens it.
 */
export default function CourseCarousel({ courses, onOpen, actionLabel = 'Open course', renderMeta }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const touchStartX = useRef(null);

  const count = courses.length;
  const clamped = Math.min(index, Math.max(count - 1, 0));

  // If the course list shrinks (e.g. list refreshed), keep focus in range.
  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(count - 1, 0));
  }, [count, index]);

  const go = useCallback((delta) => {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return 0;
      if (next > count - 1) return count - 1;
      return next;
    });
  }, [count]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'Home') { e.preventDefault(); setIndex(0); }
    else if (e.key === 'End') { e.preventDefault(); setIndex(count - 1); }
  }, [go, count]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (count === 0) return null;

  return (
    <div className="cc" role="group" aria-roledescription="carousel" aria-label="Course selector">
      <div
        className="cc-viewport"
        ref={trackRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="cc-stage">
          {courses.map((course, i) => {
            const offset = i - clamped;
            const abs = Math.abs(offset);
            const isActive = offset === 0;
            // Cards more than 2 away are parked off-stage and hidden from AT.
            const hidden = abs > 2;
            const style = {
              '--offset': offset,
              '--abs': abs,
              zIndex: 10 - abs,
            };
            return (
              <div
                key={course.id || course._id}
                className={`cc-card ${isActive ? 'cc-card--active' : ''} ${hidden ? 'cc-card--hidden' : ''}`}
                style={style}
                aria-hidden={hidden ? 'true' : undefined}
                {...(hidden ? { inert: '' } : {})}
              >
                <button
                  type="button"
                  className="cc-card-inner"
                  tabIndex={isActive ? 0 : -1}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => (isActive ? onOpen?.(course) : setIndex(i))}
                >
                  <span className="cc-card-glyph" aria-hidden="true">◈</span>
                  <span className="cc-card-title">{course.title || course.name || 'Untitled course'}</span>
                  {course.description && (
                    <span className="cc-card-desc">{course.description}</span>
                  )}
                  {renderMeta && <span className="cc-card-meta">{renderMeta(course)}</span>}
                  <span className="cc-card-action">{isActive ? actionLabel : 'Select'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 && (
        <div className="cc-controls">
          <button
            type="button"
            className="cc-nav"
            onClick={() => go(-1)}
            disabled={clamped === 0}
            aria-label="Previous course"
          >←</button>

          <div className="cc-dots" role="tablist" aria-label="Courses">
            {courses.map((course, i) => (
              <button
                key={course.id || course._id}
                type="button"
                role="tab"
                aria-selected={i === clamped}
                aria-label={course.title || `Course ${i + 1}`}
                className={`cc-dot ${i === clamped ? 'cc-dot--active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>

          <button
            type="button"
            className="cc-nav"
            onClick={() => go(1)}
            disabled={clamped === count - 1}
            aria-label="Next course"
          >→</button>
        </div>
      )}

      <div className="cc-counter t-mono" aria-live="polite">
        {clamped + 1} / {count}
      </div>
    </div>
  );
}
