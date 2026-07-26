import React from 'react';
import './Toolbar.css';

const ROLE_ICON = { educator: '◈', student: '◎' };

export default function Toolbar({ mode, role, course, onModeChange, onAddConcept, onBackToCourses, saving }) {
  const isEducator = mode === 'educator';

  return (
    <header className="toolbar">
      {/* left: brand + back */}
      <div className="tb-left">
        <button className="tb-back btn btn-ghost btn-sm" onClick={onBackToCourses} title="Back to courses">
          ← Back
        </button>
        <div className="tb-divider-v" />
        <div className="tb-course">
          <span className="t-mono" style={{ color: 'var(--c-accent)', fontSize: 13 }}>◈</span>
          <span className="tb-course-name">{course?.title ?? 'Waypoint'}</span>
        </div>
      </div>

      {/* center: mode toggle */}
      <div className="tb-mode" role="tablist" aria-label="View mode">
        <button
          role="tab"
          aria-selected={mode === 'educator'}
          className={`tb-mode-btn ${mode === 'educator' ? 'is-active' : ''}`}
          onClick={() => onModeChange('educator')}
        >
          ◈ Educator
        </button>
        <button
          role="tab"
          aria-selected={mode === 'student'}
          className={`tb-mode-btn ${mode === 'student' ? 'is-active' : ''}`}
          onClick={() => onModeChange('student')}
        >
          ◎ Student
        </button>
      </div>

      {/* right: actions + status */}
      <div className="tb-right">
        {isEducator ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={onAddConcept}>+ Add concept</button>
            <span className="tb-hint">Double-click map to drop · Delete key removes selected</span>
          </>
        ) : (
          <span className="tb-hint">Click any node to set your mastery status</span>
        )}

        {saving && (
          <div className="tb-saving">
            <span className="tb-dot" />
            <span>Saving</span>
          </div>
        )}
      </div>
    </header>
  );
}
