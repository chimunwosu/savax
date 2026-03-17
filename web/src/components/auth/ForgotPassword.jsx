import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowLeft, Mail, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function ForgotPassword() {
  const { resetPassword, confirmReset } = useAuth();
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=done
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleRequestCode(e) {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = resetPassword(email);
      if (result.success) {
        setDemoCode(result.code);
        setStep(2);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 500);
  }

  function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    if (!code || !newPassword || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = confirmReset(email, code, newPassword);
      if (result.success) {
        setStep(3);
      } else {
        setError(result.error);
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
                <p>Enter your email to receive a reset code</p>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleRequestCode} className="auth-form">
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
                  {loading ? <span className="auth-spinner" /> : <><Mail size={18} /> Send Reset Code</>}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-card-header">
                <h2>Enter Reset Code</h2>
                <p>Check your email for the 6-digit code</p>
              </div>
              <div className="auth-demo-code">
                <span>Demo Mode — Your reset code is:</span>
                <strong>{demoCode}</strong>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label>Reset Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="New password (min 8 chars)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : <><KeyRound size={18} /> Reset Password</>}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="auth-success">
              <div className="auth-success-icon">
                <Check size={40} />
              </div>
              <h2>Password Reset!</h2>
              <p>Your password has been updated successfully. You can now sign in with your new password.</p>
              <Link to="/login" className="btn btn-primary auth-submit" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                Go to Sign In
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
