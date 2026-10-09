
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register(name, email, password);
      setSuccess("Account created. Redirecting to login...");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed."
      );
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Link to="/login" className="auth-brand">
          <CheckSquare size={30} />
          TaskFlow
        </Link>

        <h1>Create account</h1>
        <p className="muted">Start organizing your team's work.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <label htmlFor="name">Full name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <button className="btn btn-primary full-width" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}