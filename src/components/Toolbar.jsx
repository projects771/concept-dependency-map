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
      <div className="tb-role-badge" style={{ '--role-color': roleConf.color }}>
        <span className="tb-role-icon">{roleConf.icon}</span>
        <span className="tb-role-label">{roleConf.label}</span>
      </div>

      {/* right: role-specific actions */}
      <div className="tb-right">
        {isEducator ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={onRelayout} title="Auto-layout concepts top-to-bottom">
              <span style={{ fontSize: 14 }}>▦</span> Auto-layout
            </button>
            <button className="btn btn-primary btn-sm" onClick={onAddConcept}>
              + Add concept
            </button>
            {course?.courseCode && (
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 12,
              }}>
                <span style={{ color: '#9ca3af' }}>Join code:</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#e8e9f0',
                  letterSpacing: 2,
                }}>{course.courseCode}</span>
                <button
                  onClick={handleCopy}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copied ? '#22c55e' : '#9ca3af',
                    fontSize: 12,
                    padding: '2px 4px',
                  }}
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
