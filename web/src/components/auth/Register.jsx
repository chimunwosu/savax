import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRandomWisdom } from '../../data/babylonWisdom';
import './Auth.css';

const passwordRules = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'One uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: p => /[a-z]/.test(p) },
  { label: 'One number', test: p => /[0-9]/.test(p) },
];

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allPassed = passwordRules.every(r => r.test(form.password));

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!allPassed) {
      setError('Password does not meet requirements.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register({ name: form.name, email: form.email, password: form.password });
      if (!result.success) setError(result.error);
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
            <span>Save at least 10% of income</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" style={{ background: '#2d6a4f' }} />
            <span>Control your expenditures</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" style={{ background: '#457b9d' }} />
            <span>Make your gold multiply</span>
          </div>
          <div className="auth-feature">
            <div className="auth-feature-dot" style={{ background: '#6c5ce7' }} />
            <span>Guard against loss</span>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Start your journey to financial wisdom</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Arkad of Babylon"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
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
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="auth-password-rules">
                  {passwordRules.map((rule, i) => (
                    <div key={i} className={`auth-rule ${rule.test(form.password) ? 'auth-rule-pass' : 'auth-rule-fail'}`}>
                      {rule.test(form.password) ? <Check size={14} /> : <X size={14} />}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                autoComplete="new-password"
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="auth-field-error">Passwords do not match</p>
              )}
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
