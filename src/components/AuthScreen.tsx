import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import logo from '../images/egwiapp.jpg';

interface AuthScreenProps {
  onAuth: (accessToken: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'individual' as 'individual' | 'business',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data.session?.access_token) onAuth(data.session.access_token);
      } else {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(formData),
          }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data.session?.access_token) onAuth(data.session.access_token);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logoSmall}>
          <img src={logo} alt="NaijaTaxMate Logo" style={styles.image} />
        </div>
        <h1 style={styles.title}>NaijaTaxMate</h1>
        <p style={styles.subtitle}>
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {!isLogin && (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={styles.input}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Type</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="userType"
                    value="individual"
                    checked={formData.userType === 'individual'}
                    onChange={() => setFormData({ ...formData, userType: 'individual' })}
                    style={styles.radio}
                  />
                  <span>Individual Taxpayer</span>
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="userType"
                    value="business"
                    checked={formData.userType === 'business'}
                    onChange={() => setFormData({ ...formData, userType: 'business' })}
                    style={styles.radio}
                  />
                  <span>Small Business Owner</span>
                </label>
              </div>
            </div>
          </>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={styles.input}
            required
            placeholder="your.email@example.com"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={styles.input}
            required
            placeholder="Enter your password"
            minLength={6}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          type="submit"
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          disabled={loading}
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <div style={styles.toggle}>
          <span style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={styles.toggleButton}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          In compliance with Nigerian Tax Reform Act
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    marginTop: '40px',
  },
  logoSmall: {
    display: 'inline-block',
    marginBottom: '16px',
  },
  image: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0A5C36',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6C757D',
    margin: 0,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#212529',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #DEE2E6',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#495057',
    cursor: 'pointer',
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#0A5C36',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    backgroundColor: '#F8D7DA',
    color: '#721C24',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  toggle: {
    textAlign: 'center',
    marginTop: '20px',
  },
  toggleText: {
    fontSize: '14px',
    color: '#6C757D',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#0A5C36',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '40px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#6C757D',
    margin: 0,
  },
};
