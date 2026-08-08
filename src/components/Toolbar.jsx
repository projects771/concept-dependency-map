import React from 'react';
import './Toolbar.css';

const ROLE_CONFIG = {
  educator: { icon: '◈', label: 'Educator', color: 'var(--c-accent)' },
  student:  { icon: '◎', label: 'Student',  color: 'var(--c-confident)' },
};

export default function Toolbar({ role, course, onAddConcept, onBackToCourses, saving }) {
  const isEducator = role === 'educator';
  const roleConf   = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;

  return (
    <header className="toolbar">
      {/* left: back + course */}
      <div className="tb-left">
        <button className="tb-back btn btn-ghost btn-sm" onClick={onBackToCourses} title="Back to courses">
          ← Back
        </button>
        <div className="tb-divider-v" />
        <div className="tb-course">
          <span className="t-mono tb-course-icon">◈</span>
          <span className="tb-course-name">{course?.title ?? 'Nodemap'}</span>
        </div>
      </div>

      {/* center: role badge (locked — not a toggle) */}
      <div className="tb-role-badge" style={{ '--role-color': roleConf.color }}>
        <span className="tb-role-icon">{roleConf.icon}</span>
        <span className="tb-role-label">{roleConf.label}</span>
      </div>

      {/* right: role-specific actions */}
      <div className="tb-right">
        {isEducator ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={onAddConcept}>
              + Add concept
            </button>
            <span className="tb-hint">
              Double-click canvas to drop · Select + Delete to remove
            </span>
          </>
        ) : (
          <span className="tb-hint">
            Click a concept to view it and update your progress
          </span>
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
