import { API_URL } from '../config.js';
import React, { useState } from 'react';

export default function ResetPasswordModal({ isOpen, token, onClose, onLoginClick }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    fetch(API_URL + '/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword })
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid or expired reset link. Please request a new one.');
        return res.json();
      })
      .then(() => {
        setSuccess(true);
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>&times;</button>
        
        <h3 style={{ marginBottom: '15px', fontSize: '20px', textAlign: 'center' }}>Reset Password</h3>

        {error && <div className="auth-error-msg">{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ marginBottom: '15px', margin: '0 auto', display: 'block' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h4 style={{ marginBottom: '10px', marginTop: '10px' }}>Password Updated!</h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your password has been changed successfully.</p>
            <button 
              className="btn btn-primary full-width" 
              onClick={() => { onClose(); onLoginClick(); }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary full-width">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
