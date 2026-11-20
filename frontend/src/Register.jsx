
import { useState } from "react";
import {
  User,
  Building2,
  ArrowLeft
} from "lucide-react";

function Register({ onBack, onLogin }) {
  const [accountType, setAccountType] = useState("jobseeker");

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    mobile: "",
    education: "",
    website: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const apiBaseUrl = (
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8001"
    ).replace(/\/+$/, "");

    const payload = {
      name: form.name.trim(),
      companyName: form.companyName.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      education: form.education.trim(),
      website: form.website.trim(),
      password: form.password,
      accountType
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${apiBaseUrl}/api/accounts/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          Object.values(data).flat().join(" ") ||
          "Registration failed."
        );
      }

      localStorage.setItem("nearbyJobsToken", data.token);
      localStorage.setItem("nearbyJobsAccountType", data.account_type);
      localStorage.setItem("nearbyJobsEmail", data.email);

      setSuccess(
        "Account created successfully! You can now log in."
      );

      setForm({
        name: "",
        companyName: "",
        email: "",
        mobile: "",
        education: "",
        website: "",
        password: "",
        confirmPassword: ""
      });

    } catch (err) {
      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button
          className="auth-back"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <h1>Create Account</h1>
        <p>Join Nearby Jobs and find your next opportunity.</p>

        <div className="account-options">
          <button
            type="button"
            className={accountType === "jobseeker" ? "active" : ""}
            onClick={() => setAccountType("jobseeker")}
          >
            <User size={17} /> Job Seeker
          </button>

          <button
            type="button"
            className={accountType === "company" ? "active" : ""}
            onClick={() => setAccountType("company")}
          >
            <Building2 size={17} /> Company
          </button>
        </div>

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {success && (
          <p style={{ color: "green" }}>{success}</p>
        )}

        <form onSubmit={handleSubmit}>

          {accountType === "jobseeker" ? (
            <>
              <label>Full Name</label>
              <input
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>Education</label>
              <input
                name="education"
                placeholder="Example: B.Tech CSE"
                value={form.education}
                onChange={handleChange}
                required
              />
            </>
          ) : (
            <>
              <label>Company Name</label>
              <input
                name="companyName"
                placeholder="Enter company name"
                value={form.companyName}
                onChange={handleChange}
                required
              />

              <label>Company Website (Optional)</label>
              <input
                name="website"
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={handleChange}
              />
            </>
          )}

          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Mobile Number</label>
          <input
            name="mobile"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={form.mobile}
            onChange={handleChange}
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <label>Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength={8}
            required
          />

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : `Register as ${accountType === "jobseeker" ? "Job Seeker" : "Company"}`}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={onLogin}>
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;
