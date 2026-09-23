import React, { useState } from 'react';
import './Toolbar.css';

const ROLE_CONFIG = {
  educator: { icon: '◈', label: 'Educator', color: 'var(--c-accent)' },
  student:  { icon: '◎', label: 'Student',  color: 'var(--c-confident)' },
};

export default function Toolbar({ role, course, onAddConcept, onBackToCourses, saving, onRelayout }) {
  const isEducator = role === 'educator';
  const roleConf   = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!course?.courseCode) return;
    navigator.clipboard.writeText(course.courseCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className={`tb-role-badge ${isEducator ? 'tb-role-badge--educator' : 'tb-role-badge--student'}`}>
        <span className="tb-role-icon">{roleConf.icon}</span>
        <span className="tb-role-label">{roleConf.label}</span>
      </div>

      {/* right: role-specific actions */}
      <div className="tb-right">
        {isEducator ? (
          <>
            <button className="tb-btn-layout" onClick={onRelayout} title="Auto-layout concepts top-to-bottom">
              <span style={{ fontSize: 13 }}>▦</span> Auto-layout
            </button>
            <button className="tb-btn-add" onClick={onAddConcept}>
              + Add concept
            </button>
            {course?.courseCode && (
              <div className="tb-code-pill">
                <span>Join code:</span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>{course.courseCode}</span>
                <button
                  onClick={handleCopy}
                  className={`tb-code-copy-btn ${copied ? 'tb-code-copy-btn--copied' : ''}`}
                  title="Copy join code"
                >
                  {copied ? '✓ Copied!' : '⧉ Copy'}
                </button>
              </div>
            )}
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
