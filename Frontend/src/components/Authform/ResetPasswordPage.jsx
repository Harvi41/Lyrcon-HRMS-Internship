import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { resetPassword } from '../../lib/axios';

const PayrollIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#22c55e"/>
    <path d="M7 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ResetPasswordPage({ token, onComplete }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await resetPassword(token, newPassword);
      setSuccessMessage(data?.message || "Password successfully updated! You can now log in.");
    } catch (resetError) {
      setError(
        resetError?.response?.data?.message ||
        resetError.message ||
        "Unable to reset password. The link may have expired or is invalid."
      );
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
            Secure your<br />account.
          </h1>
          <p className={styles.subheadline}>
            Create a new strong password to protect your account data and dashboard access.
          </p>

          {/* Payroll Processed Indicator Widget */}
          <div className={styles.payrollWidget}>
            <PayrollIcon />
            <div className={styles.widgetText}>
              <span className={styles.widgetTitle}>Advanced Security</span>
              <span className={styles.widgetSub}>All database sessions are encrypted.</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right Auth Panel ── */}
      <main className={styles.authPanel}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h2 className={styles.welcomeTitle}>New password</h2>
            <p className={styles.welcomeSub}>Please choose a secure and memorable password.</p>
          </div>

          {error ? <div className={styles.authError}>{error}</div> : null}
          {successMessage ? <div className={styles.authSuccess}>{successMessage}</div> : null}

          {successMessage ? (
            <button
              type="button"
              className={styles.submitBtn}
              onClick={onComplete}
            >
              Back to Login
            </button>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  className={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
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
                  "Reset Password"
                )}
              </button>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onComplete(); }}
                className={styles.forgotLink}
                style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}
              >
                Cancel and return to login
              </a>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
