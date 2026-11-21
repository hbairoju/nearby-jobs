
import { useState } from "react";
import { Mail, Phone, ArrowLeft } from "lucide-react";

function Login({ onBack, onRegister, onLogin }) {
  const [method, setMethod] = useState("email");
  const [accountType, setAccountType] = useState("jobseeker");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8001"
  ).replace(/\/+$/, "");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (method === "mobile") {
      setError("Mobile OTP login is not connected yet. Please use email login.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${apiBaseUrl}/api/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          accountType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please check your details.");
      }

      localStorage.setItem("nearbyJobsToken", data.token);
      localStorage.setItem("nearbyJobsAccountType", data.account_type);
      localStorage.setItem("nearbyJobsEmail", data.email);

      onLogin?.({
        token: data.token,
        accountType: data.account_type,
        email: data.email
      });

      setSuccess("Login successful!");

      setTimeout(() => {
        onBack();
      }, 800);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        `${apiBaseUrl}/api/accounts/password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail.trim().toLowerCase()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to request password reset.");
      }

      setSuccess(data.message);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack} type="button">
          <ArrowLeft size={18} /> Back to Home
        </button>

        <h1>{forgotPassword ? "Forgot Password?" : "Welcome Back!"}</h1>
        <p>
          {forgotPassword
            ? "Enter your registered email to receive a password reset link."
            : "Login to continue to Nearby Jobs."}
        </p>

        {!forgotPassword && (
          <>
            <div className="account-options">
              <button
                className={accountType === "jobseeker" ? "active" : ""}
                onClick={() => setAccountType("jobseeker")}
                type="button"
              >
                Job Seeker
              </button>

              <button
                className={accountType === "company" ? "active" : ""}
                onClick={() => setAccountType("company")}
                type="button"
              >
                Company
              </button>
            </div>

            <div className="login-options">
              <button
                className={method === "email" ? "active" : ""}
                onClick={() => setMethod("email")}
                type="button"
              >
                <Mail size={17} /> Email
              </button>

              <button
                className={method === "mobile" ? "active" : ""}
                onClick={() => setMethod("mobile")}
                type="button"
              >
                <Phone size={17} /> Mobile OTP
              </button>
            </div>
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        {forgotPassword ? (
          <form onSubmit={handleForgotPassword}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotPassword(false);
                setError("");
                setSuccess("");
              }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin}>
              {method === "email" ? (
                <>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPassword(true);
                      setResetEmail(email);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Forgot Password?
                  </button>
                </>
              ) : (
                <>
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />

                  <label>OTP</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />

                  <p className="otp-note">
                    Mobile OTP login will be connected separately.
                  </p>
                </>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : `Login as ${accountType === "jobseeker" ? "Job Seeker" : "Company"}`}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <button onClick={onRegister} type="button">
                Register Now
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
