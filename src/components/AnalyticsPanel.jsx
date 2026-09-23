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
    <div className="sp sp--open" style={{ 
      right: 'auto', 
      left: 0, 
      background: '#111111', 
      borderRight: '1px solid rgba(255,255,255,0.06)', 
      borderLeft: 'none',
      width: 300
    }}>
      <div className="sp-header" style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ color: '#444444', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'monospace' }}>
          Class Overview
        </div>
      </div>
      <div className="sp-scroll-area" style={{ padding: '0 20px' }}>
        {analytics.length === 0 && <p style={{ color: '#666666', fontSize: 13, padding: '20px 0' }}>No data to analyze.</p>}
        {analytics.map(c => {
          const total = c.confident + c.learning + c.struggling;
          const isClassGap = total > 0 && (c.struggling / total) > 0.5;
          return (
            <div key={c.id} style={{ 
              padding: '14px 0', 
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#ffffff', fontSize: 13, fontWeight: 500 }}>{c.title}</span>
                {isClassGap && (
                  <span style={{ 
                    background: 'rgba(239,68,68,0.1)', 
                    border: '1px solid rgba(239,68,68,0.2)', 
                    color: '#ef4444', 
                    borderRadius: 4, 
                    fontSize: 11, 
                    padding: '2px 8px',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    ⚠ Class gap
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaaaaa' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                    Confident
                  </span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>{c.confident}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaaaaa' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                    Learning
                  </span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>{c.learning}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaaaaa' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                    Struggling
                  </span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>{c.struggling}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
