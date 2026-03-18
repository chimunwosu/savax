import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Coins, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRandomWisdom } from '../../data/babylonWisdom';
import './Auth.css';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) return <Navigate to="/" replace />;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login({ email: form.email, password: form.password });
      if (!result.success) {
        setError(result.error);
      } else {
        navigate('/', { replace: true });
      }
      setLoading(false);
    }, 500);
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Coins size={48} color="#D4AF37" />
          <h1>Savax</h1>
          <p className="auth-tagline">Build Wealth the Babylon Way</p>
        </div>
        <div className="auth-wisdom">
          <p>"{getRandomWisdom()}"</p>
          <span>- The Richest Man in Babylon</span>
        </div>
        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-dot" style={{ background: '#D4AF37' }} />
            <span>Track Income & Expenses</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" style={{ background: '#2d6a4f' }} />
            <span>Smart Investment Tracking</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" style={{ background: '#457b9d' }} />
            <span>7 Laws of Wealth Dashboard</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" style={{ background: '#6c5ce7' }} />
            <span>Babylon Wealth Advisor</span>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your wealth journey</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="auth-options">
              <label className="auth-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
