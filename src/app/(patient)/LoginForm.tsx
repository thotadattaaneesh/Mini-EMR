import React, { useState } from 'react';
import styles from './portal.module.css';

type Props = {
  name: string;
  setName: (n: string) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  error: string;
  handleLogin: (e: React.FormEvent) => void;
  handleSignup: (e: React.FormEvent) => void;
  isLoading?: boolean;
};

export default function LoginForm({ name, setName, email, setEmail, password, setPassword, error, handleLogin, handleSignup, isLoading }: Props) {
  const [isSignupMode, setIsSignupMode] = useState(false);
  return (
    <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className={styles.card} style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src="https://cdn.prod.website-files.com/64ac3a433180d94638a63ead/64acc00e5f8b28a1f8b430a9_Logo-Zealthy-Black.svg" 
            alt="Zealthy Logo" 
            style={{ maxWidth: '150px' }} 
          />
          <h1 className={styles.cardTitle} style={{ marginTop: '16px' }}>Patient Portal</h1>
        </div>
        
        {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
        
        <form onSubmit={isSignupMode ? handleSignup : handleLogin}>
          {isSignupMode && (
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
            </div>
          )}
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
          </div>
          <button type="submit" className={styles.button} style={{ width: '100%', marginBottom: '16px' }} disabled={isLoading}>
            {isLoading ? 'Please wait...' : isSignupMode ? 'Create Account' : 'Login'}
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            {isSignupMode ? (
              <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignupMode(false); }} style={{ color: '#0056b3', textDecoration: 'underline' }}>Login here</a></p>
            ) : (
              <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsSignupMode(true); }} style={{ color: '#0056b3', textDecoration: 'underline' }}>Sign up here</a></p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
