import React from 'react';

export default function Logo({ size = 28, fontSize = 18 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width={size} height={size}>
        <rect x="0" y="0" width="52" height="52" rx="10" fill="#1a1a1a"/>
        <rect x="0" y="0" width="52" height="52" rx="10" fill="none" stroke="#3a3a3a" strokeWidth="1"/>
        <circle cx="26" cy="10" r="5.5" fill="white" opacity="0.95"/>
        <circle cx="10" cy="26" r="5.5" fill="white" opacity="0.6"/>
        <circle cx="42" cy="26" r="5.5" fill="white" opacity="0.6"/>
        <circle cx="26" cy="42" r="5.5" fill="white" opacity="0.28"/>
        <line x1="26" y1="15.5" x2="13.5" y2="20.5" stroke="#777777" strokeWidth="1.5" opacity="0.8"/>
        <line x1="26" y1="15.5" x2="38.5" y2="20.5" stroke="#777777" strokeWidth="1.5" opacity="0.8"/>
        <line x1="12" y1="31.5" x2="21" y2="36.5" stroke="#777777" strokeWidth="1.5" opacity="0.8"/>
        <line x1="40" y1="31.5" x2="31" y2="36.5" stroke="#777777" strokeWidth="1.5" opacity="0.8"/>
      </svg>
      <span style={{
        fontSize: fontSize,
        letterSpacing: '-0.5px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <span style={{ color: '#ffffff', fontWeight: 600 }}>Node</span>
        <span style={{ color: '#888888', fontWeight: 300 }}>map</span>
      </span>
    </div>
  );
}
