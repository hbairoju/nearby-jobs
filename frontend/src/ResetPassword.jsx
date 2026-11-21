
import { useState } from "react";

function ResetPassword({ uid, token, onBack }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const apiBaseUrl = (
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8001"
    ).replace(/\/+$/, "");

    try {
      setLoading(true);

      const response = await fetch(
        `${apiBaseUrl}/api/accounts/password-reset/confirm/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            uid,
            token,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to reset password.");
      }

      localStorage.removeItem("nearbyJobsToken");
      localStorage.removeItem("nearbyJobsAccountType");
      localStorage.removeItem("nearbyJobsEmail");

      setSuccess(data.message || "Password reset successful!");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={8}
              required
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              required
            />

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {success && (
          <button className="auth-submit" onClick={onBack}>
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
