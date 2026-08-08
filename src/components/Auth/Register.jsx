import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      if (user.role === 'educator') navigate('/dashboard');
      else navigate('/student/join');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    alert('Google Sign-Up is not implemented yet.');
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--c-surface-2, #1f2937)',
    border: '1px solid var(--c-border, #374151)',
    color: 'white',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '14px',
  };

  const labelStyle = {
    display: 'block',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px',
  };

  return (
    <div className="ls-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '420px', width: '100%', padding: '40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width={48} height={48} style={{ marginBottom: '16px' }}>
            <rect x="0" y="0" width="52" height="52" rx="12" fill="#1D4ED8"/>
            <circle cx="26" cy="8" r="5" fill="white" opacity="0.95"/>
            <circle cx="8" cy="26" r="5" fill="white" opacity="0.7"/>
            <circle cx="44" cy="26" r="5" fill="white" opacity="0.7"/>
            <circle cx="26" cy="44" r="5" fill="white" opacity="0.5"/>
            <line x1="26" y1="13" x2="11" y2="21" stroke="white" strokeWidth="1.5" opacity="0.6"/>
            <line x1="26" y1="13" x2="41" y2="21" stroke="white" strokeWidth="1.5" opacity="0.6"/>
            <line x1="11" y1="31" x2="21" y2="39" stroke="white" strokeWidth="1.5" opacity="0.6"/>
            <line x1="41" y1="31" x2="31" y2="39" stroke="white" strokeWidth="1.5" opacity="0.6"/>
          </svg>
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.3rem', margin: '0 0 8px 0' }}>Create your account</h1>
          <p style={{ color: 'var(--brand-accent)', margin: 0 }}>Joining as {role}</p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'var(--c-surface-2, #1f2937)',
            color: 'white',
            border: '1px solid var(--c-border, #374151)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '24px',
          }}
        >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'white',
            color: 'black',
            fontWeight: 'bold',
            marginRight: '12px',
            fontSize: '14px',
          }}>
            G
          </span>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <hr style={{ flex: 1, borderColor: 'var(--c-border, #374151)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
          <span style={{ color: 'var(--c-text-3, #9ca3af)', padding: '0 12px', fontSize: '14px' }}>or</span>
          <hr style={{ flex: 1, borderColor: 'var(--c-border, #374151)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
        </div>

        {error && <div style={{ color: 'var(--c-error, #ef4444)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="name" style={labelStyle}>Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'var(--brand-primary, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--c-text-3, #9ca3af)' }}>
          Already have an account?{' '}
          <Link to={`/signin?role=${role}`} style={{ color: 'var(--brand-accent, #3b82f6)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
