import React from 'react';

export default function Logo({ size = 32, fontSize = 20 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width={size} height={size}>
        <rect x="0" y="0" width="52" height="52" rx="10" fill="#1D4ED8"/>
        <circle cx="26" cy="8" r="5" fill="white" opacity="0.95"/>
        <circle cx="8" cy="26" r="5" fill="white" opacity="0.7"/>
        <circle cx="44" cy="26" r="5" fill="white" opacity="0.7"/>
        <circle cx="26" cy="44" r="5" fill="white" opacity="0.5"/>
        <line x1="26" y1="13" x2="11" y2="21" stroke="white" strokeWidth="1.5" opacity="0.6"/>
        <line x1="26" y1="13" x2="41" y2="21" stroke="white" strokeWidth="1.5" opacity="0.6"/>
        <line x1="11" y1="31" x2="21" y2="39" stroke="white" strokeWidth="1.5" opacity="0.6"/>
        <line x1="41" y1="31" x2="31" y2="39" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      </svg>
      <span style={{ fontSize: fontSize, fontWeight: 600, letterSpacing: '-0.5px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <span style={{ color: '#111827' }}>Node</span><span style={{ color: '#3B82F6' }}>map</span>
      </span>
    </div>
  );
}
