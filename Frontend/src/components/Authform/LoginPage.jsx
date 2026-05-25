import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { loginUser, forgotPassword } from '../../lib/axios';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.96 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

const PayrollIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#22c55e" />
    <path d="M7 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
      };

      const { data } = await loginUser(payload);

      if (!data) {
        throw new Error('Unable to sign in right now.');
      }

      window.localStorage.setItem('corehr_token', data.token);
      window.localStorage.setItem('corehr_user', JSON.stringify(data.user));
      window.localStorage.setItem('corehr_role', data.user?.role || '');

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (loginError) {
      setError(loginError?.response?.data?.message || loginError.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data } = await forgotPassword(email);
      setSuccessMessage(data?.message || 'Password reset link sent! Please check your inbox.');
    } catch (forgotError) {
      setError(forgotError?.response?.data?.message || forgotError.message || 'Unable to request password reset right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* ── Left Branding Panel ── */}
      <aside className={styles.brandPanel}>
        {/* Background decorative elements */}
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />

        <div className={styles.brandContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span className={styles.logoText}>CoreHR</span>
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            Empower your<br />workforce.
          </h1>
          <p className={styles.subheadline}>
            Sign in to manage payroll, benefits,<br />and global team performance.
          </p>
        </div>
      </aside>

      {/* ── Right Auth Panel ── */}
      <main className={styles.authPanel}>
        {view === 'login' ? (
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <h2 className={styles.welcomeTitle}>Welcome back</h2>
              <p className={styles.welcomeSub}>Enter your details to access your dashboard.</p>
            </div>

            {error ? <div className={styles.authError}>{error}</div> : null}

            {/* Google SSO Button */}
            <button className={styles.googleBtn} type="button">
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>

            {/* Divider Splitter */}
            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>OR EMAIL</span>
              <span className={styles.dividerLine} />
            </div>

            {/* Credentials Entry Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="email">Work Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.passwordLabelRow}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setView('forgot'); setError(''); setSuccessMessage(''); }}
                    className={styles.forgotLink}
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Loading / Action Processing Button State */}
              <button
                type="submit"
                className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <h2 className={styles.welcomeTitle}>Reset password</h2>
              <p className={styles.welcomeSub}>Enter your work email address and we'll send you a link to reset your password.</p>
            </div>

            {error ? <div className={styles.authError}>{error}</div> : null}
            {successMessage ? <div className={styles.authSuccess}>{successMessage}</div> : null}

            {/* Credentials Entry Form */}
            <form className={styles.form} onSubmit={handleForgotSubmit}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="forgot-email">Work Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Loading / Action Processing Button State */}
              <button
                type="submit"
                className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setView('login'); setError(''); setSuccessMessage(''); }}
                className={styles.forgotLink}
                style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}
              >
                Back to login
              </a>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}