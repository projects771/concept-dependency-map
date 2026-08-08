import React, { useState, useEffect } from 'react';
import * as api from '../api/api.js';

export default function AnalyticsPanel({ courseId }) {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    api.fetchAnalytics(courseId)
      .then(d => setAnalytics(d.analytics))
      .catch(e => console.error(e));
  }, [courseId]);

  return (
    <div className="sp sp--open" style={{ right: 'auto', left: 0, borderRight: '1px solid var(--c-border)', borderLeft: 'none' }}>
      <div className="sp-header">
        <div className="sp-eyebrow t-mono t-faint">Class Overview</div>
      </div>
      <div className="sp-scroll-area">
        {analytics.length === 0 && <p className="sp-desc">No data to analyze.</p>}
        {analytics.map(c => {
          const total = c.confident + c.learning + c.struggling;
          const isClassGap = total > 0 && (c.struggling / total) > 0.5;
          return (
            <div key={c.id} style={{ 
              marginBottom: 16, 
              padding: 12, 
              background: 'var(--c-surface-2)', 
              borderRadius: 'var(--r-md)', 
              border: isClassGap ? '1px solid var(--c-struggling)' : '1px solid transparent' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{c.title}</span>
                {isClassGap && <span style={{ color: 'var(--c-struggling)', fontSize: 12, fontWeight: 'bold' }}>⚠ Class gap</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-confident)' }}>
                  <span>Confident</span><span>{c.confident}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-learning)' }}>
                  <span>Learning</span><span>{c.learning}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-struggling)' }}>
                  <span>Struggling</span><span>{c.struggling}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
