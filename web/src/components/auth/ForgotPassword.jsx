import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowLeft, Mail, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1=email, 2=done
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestReset(e) {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setStep(2);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
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
          <p>"Where the determination is, the way can be found."</p>
          <span>- The Richest Man in Babylon</span>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          {step === 1 && (
            <>
              <div className="auth-card-header">
                <h2>Reset Password</h2>
                <p>Enter your email and we'll send you a reset link</p>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleRequestReset} className="auth-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : <><Mail size={18} /> Send Reset Link</>}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="auth-success">
              <div className="auth-success-icon">
                <Check size={40} />
              </div>
              <h2>Check Your Email</h2>
              <p>We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.</p>
              <Link to="/login" className="btn btn-primary auth-submit" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                Back to Sign In
              </Link>
            </div>
          )}

          <div className="auth-footer">
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
