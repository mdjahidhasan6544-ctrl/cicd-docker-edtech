import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import DeviceWarning from "../components/DeviceWarning.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function buildDeviceFingerprint() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    resolution: `${window.screen.width}x${window.screen.height}`,
    platform: navigator.platform
  };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, login, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [deviceWarning, setDeviceWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="screen-state">Checking session...</div>;
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setDeviceWarning("");

    try {
      const nextUser = await login({
        ...form,
        deviceFingerprint: buildDeviceFingerprint()
      });

      const destination =
        nextUser.role === "admin"
          ? "/admin"
          : location.state?.from || "/dashboard";

      navigate(destination, { replace: true });
    } catch (requestError) {
      const message = requestError.message || "Login failed";
      setError(message);

      if (message.toLowerCase().includes("device limit")) {
        setDeviceWarning(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  return (
    <section className="auth-screen">
      <div className="auth-hero">
        <div className="auth-brand-row">
          <span className="brand-mark">SS</span>
          <div>
            <p className="eyebrow">OLevelStarsBD</p>
            <strong>Secure Cambridge learning access</strong>
          </div>
        </div>
        <p className="eyebrow">Verified learning access</p>
        <h1>Premium Cambridge learning for Pre-O Level and O Level science students.</h1>
        <p>
          One expert teacher. 10+ years of classroom experience. Mathematics, Physics,
          Chemistry, Biology, and Computer Science organized into calm, structured study
          paths with manual approval for secure access.
        </p>
        <div className="auth-hero-points">
          <div>
            <span>01</span>
            <p>Weekly structure, lesson progression, and revision flow in one student space.</p>
          </div>
          <div>
            <span>02</span>
            <p>Manual approval and device-aware login controls for protected access.</p>
          </div>
          <div>
            <span>03</span>
            <p>Focused practice, live classes, and payment tracking without platform clutter.</p>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <DeviceWarning message={deviceWarning} onClose={() => setDeviceWarning("")} />
        <p className="eyebrow">Welcome back</p>
        <h2>Log in</h2>
        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              name="email"
              onChange={handleChange}
              placeholder="student@example.com"
              type="email"
              value={form.email}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              className="input"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              type="password"
              value={form.password}
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="button button-primary button-full" disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="muted-copy">
          New student? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
