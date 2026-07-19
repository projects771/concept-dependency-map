import React from 'react';
import './Toolbar.css';

export default function Toolbar({
  mode,
  course,
  onModeChange,
  onAddConcept,
  onBackToCourses,
  saving,
  error,
  onDismissError,
}) {
  return (
    <div className="toolbar-wrap">
      <div className="toolbar">
        {/* Brand + back nav */}
        <div className="toolbar-brand">
          <span className="toolbar-brand-mark" aria-hidden="true">◈</span>
          <div>
            <div className="toolbar-brand-title font-display">Waypoint</div>
            {course && (
              <div className="toolbar-brand-sub font-mono">{course.title}</div>
            )}
          </div>
        </div>

        {/* Back to course list */}
        <button className="btn btn-ghost toolbar-back" onClick={onBackToCourses} title="Switch course">
          ← courses
        </button>

        {/* Educator / Student toggle */}
        <div className="toolbar-mode" role="tablist" aria-label="View mode">
          <button
            role="tab"
            aria-selected={mode === 'educator'}
            className={`toolbar-mode-btn ${mode === 'educator' ? 'is-active' : ''}`}
            onClick={() => onModeChange('educator')}
          >
            Educator
          </button>
          <button
            role="tab"
            aria-selected={mode === 'student'}
            className={`toolbar-mode-btn ${mode === 'student' ? 'is-active' : ''}`}
            onClick={() => onModeChange('student')}
          >
            Student
          </button>
        </div>

        {/* Mode-specific controls */}
        <div className="toolbar-controls">
          {mode === 'educator' ? (
            <>
              <button className="btn btn-primary" onClick={onAddConcept}>+ Add concept</button>
              <span className="toolbar-hint">
                Double-click the map to drop anywhere · select + Delete to remove
              </span>
            </>
          ) : (
            <span className="toolbar-hint">Click any waypoint to update your mastery status</span>
          )}
        </div>

        {/* Save indicator */}
        <div className="toolbar-status">
          {saving && (
            <span className="toolbar-saving">
              <span className="toolbar-saving-dot" /> Saving…
            </span>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="toolbar-error">
          <span>{error}</span>
          <button className="btn btn-ghost toolbar-error-dismiss" onClick={onDismissError}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
