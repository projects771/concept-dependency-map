import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import './LandingScreen.css';

export default function LandingPage() {
  return (
    <div className="ls-shell" style={{ alignItems: 'flex-start', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--c-bg)' }}>
      {/* Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: 'var(--c-surface)',
        borderBottom: '1px solid var(--c-border)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/join" className="btn btn-ghost">Sign in</Link>
          <Link to="/join" className="btn btn-primary">Get started</Link>
        </div>
      </header>

      {/* Hero section */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '120px 24px 60px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: 'var(--brand-primary, #3b82f6)',
          padding: '6px 16px',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: 500,
          marginBottom: '24px'
        }}>
          Knowledge dependency mapping
        </div>
        
        <h1 className="t-display" style={{
          color: '#fff',
          fontSize: '2.5rem',
          fontWeight: 700,
          margin: '0 0 24px 0',
          lineHeight: 1.2
        }}>
          See why you're stuck,<br/>not just where
        </h1>
        
        <p style={{
          color: 'var(--c-text-2)',
          fontSize: '1.125rem',
          maxWidth: '600px',
          margin: '0 auto 40px auto',
          lineHeight: 1.6
        }}>
          Nodemap maps your course as a knowledge graph. Students see which gaps are blocking their progress. Educators spot class-wide weaknesses in one view.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '80px' }}>
          <Link to="/join?role=educator" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>◈</span> I'm an educator
          </Link>
          <Link to="/join?role=student" className="btn btn-ghost" style={{ padding: '12px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--c-border)' }}>
            <span>◎</span> I'm a student
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          width: '100%',
          textAlign: 'left'
        }}>
          <div style={{
            backgroundColor: 'var(--c-surface-2)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--c-border)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--brand-primary, #3b82f6)' }}>❖</div>
            <h3 style={{ color: 'var(--c-text)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>Dependency graph</h3>
            <p style={{ color: 'var(--c-text-2)', margin: 0, lineHeight: 1.5 }}>Visual map of how concepts connect</p>
          </div>

          <div style={{
            backgroundColor: 'var(--c-surface-2)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--c-border)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#f59e0b' }}>⚠</div>
            <h3 style={{ color: 'var(--c-text)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>Gap highlighter</h3>
            <p style={{ color: 'var(--c-text-2)', margin: 0, lineHeight: 1.5 }}>See downstream risk when you struggle</p>
          </div>

          <div style={{
            backgroundColor: 'var(--c-surface-2)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--c-border)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--brand-primary, #3b82f6)' }}>📊</div>
            <h3 style={{ color: 'var(--c-text)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>Class analytics</h3>
            <p style={{ color: 'var(--c-text-2)', margin: 0, lineHeight: 1.5 }}>Educators spot where the whole class struggles</p>
          </div>
        </div>
      </main>
    </div>
  );
}
