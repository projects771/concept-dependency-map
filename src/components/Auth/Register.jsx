import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../Logo.jsx';

export default function Register() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(name, email, password, role);
      if (user.role === 'educator') navigate('/dashboard');
      else navigate('/student/join');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // TODO: Connect Google OAuth
    alert('Google OAuth not yet wired up. Please use Email/Password.');
  };

  return (
    <div className="ls-shell">
      <div className="ls-card animate-slide-up">
        <Link to="/join" className="ls-back-btn btn btn-ghost btn-sm" style={{ position: 'absolute', top: 20, left: 20 }}>← Back</Link>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </div>
        <h1 className="ls-headline t-display">Create Account</h1>
        <p className="ls-sub">Sign up as {role === 'educator' ? 'Educator' : 'Student'}</p>

        <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: 20 }} onClick={handleGoogle}>
          Sign up with Google
        </button>

        <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--c-faint)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or use email</div>

        <form className="ls-eid-form" onSubmit={handleSubmit}>
          <div className="ls-field">
            <label className="ls-field-label t-label t-faint">Name</label>
            <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="ls-field" style={{ marginTop: 12 }}>
            <label className="ls-field-label t-label t-faint">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="ls-field" style={{ marginTop: 12 }}>
            <label className="ls-field-label t-label t-faint">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          {error && <div className="ls-field-error" style={{ marginTop: 12 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--c-faint)' }}>
          Already have an account? <Link to={`/signin?role=${role}`} style={{ color: 'var(--c-accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
