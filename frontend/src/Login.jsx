
import { useState } from "react";
import { Mail, Phone, Lock, ArrowLeft } from "lucide-react";

function Login({ onBack, onRegister }) {
  const [method, setMethod] = useState("email");
  const [accountType, setAccountType] = useState("jobseeker");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    alert(
      method === "email"
        ? "Email login UI is ready. Real authentication will be added with the backend."
        : "Mobile OTP login UI is ready. Real OTP verification will be added with the backend."
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Home
        </button>

        <h1>Welcome Back!</h1>
        <p>Login to continue to Nearby Jobs.</p>

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
                OTP sending and verification will be connected later.
              </p>
            </>
          )}

          <button className="auth-submit" type="submit">
            Login as {accountType === "jobseeker" ? "Job Seeker" : "Company"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button onClick={onRegister} type="button">
            Register Now
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
