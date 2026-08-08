import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'student' ? 'student' : 'educator';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const isEducator = selectedRole === 'educator';
  const isStudent = selectedRole === 'student';

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      color: '#fff',
    },
    step: {
      fontSize: '0.875rem',
      color: 'var(--c-text-muted, #9ca3af)',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    heading: {
      fontSize: '1.5rem',
      marginBottom: '8px',
      color: '#fff',
      textAlign: 'center',
    },
    subtext: {
      fontSize: '1rem',
      color: 'var(--c-text-muted, #9ca3af)',
      marginBottom: '32px',
      textAlign: 'center',
    },
    cardsContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '32px',
      width: '100%',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: 'var(--c-surface-2, #1f2937)',
      borderRadius: '12px',
      padding: '24px',
      minWidth: '200px',
      flex: 1,
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      border: '2px solid transparent',
    },
    cardSelected: {
      borderColor: 'var(--brand-accent, #3b82f6)',
    },
    cardUnselected: {
      borderColor: 'var(--c-border, #374151)',
    },
    icon: {
      fontSize: '2rem',
      marginBottom: '16px',
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: '8px',
    },
    cardDesc: {
      fontSize: '0.875rem',
      color: 'var(--c-text-muted, #9ca3af)',
      lineHeight: '1.4',
    },
    badge: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      backgroundColor: 'var(--brand-accent, #3b82f6)',
      color: '#fff',
      fontSize: '0.75rem',
      padding: '4px 8px',
      borderRadius: '9999px',
      fontWeight: 'bold',
    },
    button: {
      width: '100%',
      padding: '12px 24px',
      backgroundColor: 'var(--brand-accent, #3b82f6)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'block',
    }
  };

  return (
    <div className="ls-shell">
      <div style={styles.container}>
        <div style={styles.step}>Step 1 of 2</div>
        <h1 className="t-display" style={styles.heading}>How will you use Nodemap?</h1>
        <p style={styles.subtext}>You can always switch later</p>

        <div style={styles.cardsContainer}>
          <div 
            style={{...styles.card, ...(isEducator ? styles.cardSelected : styles.cardUnselected)}}
            onClick={() => setSelectedRole('educator')}
          >
            {isEducator && <div style={styles.badge}>Selected</div>}
            <div style={styles.icon}>🎓</div>
            <div style={styles.cardTitle}>Educator</div>
            <div style={styles.cardDesc}>Build course maps and track class progress</div>
          </div>

          <div 
            style={{...styles.card, ...(isStudent ? styles.cardSelected : styles.cardUnselected)}}
            onClick={() => setSelectedRole('student')}
          >
            {isStudent && <div style={styles.badge}>Selected</div>}
            <div style={styles.icon}>📖</div>
            <div style={styles.cardTitle}>Student</div>
            <div style={styles.cardDesc}>Track your mastery and find knowledge gaps</div>
          </div>
        </div>

        <Link 
          to={`/signin?role=${selectedRole}`} 
          style={styles.button}
        >
          Continue as {selectedRole}
        </Link>
      </div>
    </div>
  );
}
