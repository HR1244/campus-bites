import { API_URL } from '../config.js';
import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!emailOrPhone || !password) {
      setError('Please fill in all fields.');
      return;
    }

    fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrPhone, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
      })
      .then(user => {
        onLoginSuccess({ id: user.id, name: user.name, email: user.email, role: user.role });
        onClose();
      })
      .catch(err => setError(err.message));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setError('Please enter a valid email.');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(regPhone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
    })
      .then(res => {
        if (!res.ok) throw new Error('Email already registered');
        return res.json();
      })
      .then(user => {
        onLoginSuccess({ id: user.id, name: user.name, email: user.email, role: user.role });
        onClose();
      })
      .catch(err => setError(err.message));
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    fetch(API_URL + '/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to send reset link');
        return res.json();
      })
      .then(() => {
        setError('Password reset link sent to your email.');
        setForgotEmail('');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>&times;</button>
        
        <div className="auth-modal-tabs">
          <button 
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Login
          </button>
          <button 
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="auth-form-group">
              <label>Email or Phone Number</label>
              <input 
                type="text" 
                placeholder="Enter email or 10-digit phone" 
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ padding: '0', fontSize: '13px', color: 'var(--primary)', height: 'auto', background: 'transparent' }}
                onClick={() => { setTab('forgot-password'); setError(''); }}
              >
                Forgot Password?
              </button>
            </div>
            <button type="submit" className="btn btn-primary full-width">Login</button>
            <div className="auth-helper-text">
              Tip: Use <strong>admin@campusbites.com</strong> or <strong>9999999999</strong> and password <strong>admin</strong> for Admin access.
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="auth-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter 10-digit mobile number" 
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Create password" 
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                placeholder="Re-enter password" 
                value={regConfirmPassword}
                onChange={e => setRegConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary full-width">Register</button>
          </form>
        )}

        {tab === 'forgot-password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Reset Password</h3>
            <div className="auth-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your registered email" 
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary full-width">Send Reset Link</button>
            <button 
              type="button" 
              className="btn btn-ghost full-width" 
              style={{ marginTop: '10px' }}
              onClick={() => { setTab('login'); setError(''); setForgotEmail(''); }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
