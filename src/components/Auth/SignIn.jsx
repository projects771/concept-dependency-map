import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGoogleLogin } from '@react-oauth/google';
import Logo from '../Logo.jsx';
import GraphBackground from '../GraphBackground.jsx';
import './Auth.css';

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const user = await loginWithGoogle(tokenResponse.access_token, role);
        if (user.role === 'educator') navigate('/dashboard');
        else navigate('/student/join');
      } catch (err) {
        setError(err.message);
      }
    },
    onError: () => setError('Google sign-in failed. Please try again.'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'educator') navigate('/dashboard');
      else navigate('/student/join');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ls-shell">
      <GraphBackground />
      <div className="auth-container animate-slide-up">
        <div className="auth-header">
          <Logo />
          <h1 className="auth-title">Sign in to Nodemap</h1>
          <p className="auth-subtitle">Continuing as {role}</p>
        </div>

        <button type="button" onClick={() => googleLogin()} className="auth-google-btn">
          <span className="auth-google-icon">G</span>
          Continue with Google
        </button>

        <div className="auth-divider">
          <hr /><span>or</span><hr />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          New to Nodemap?{' '}
          <Link to={`/register?role=${role}`}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
