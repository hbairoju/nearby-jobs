
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

function MyApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      const token = localStorage.getItem("nearbyJobsToken");

      if (!token) {
        setError("Please log in to view your applications.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/my-applications/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || data.error ||
            "Unable to load your applications."
          );
        }

        setApplications(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error("My Applications error:", err);
        setError(err.message || "Something went wrong.");

      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  function getStatusIcon(status) {
    if (status === "Shortlisted") {
      return <CheckCircle size={18} />;
    }

    if (status === "Rejected") {
      return <XCircle size={18} />;
    }

    return <Clock size={18} />;
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  return (
    <div className="applications-dashboard">
      <div className="applications-container">

        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>

        <h1>My Applications</h1>

        <p>Track the jobs you have applied for.</p>

        {loading ? (
          <div className="no-applications">
            <p>Loading your applications...</p>
          </div>

        ) : error ? (
          <div className="no-applications">
            <XCircle size={40} />
            <h2>Unable to load applications</h2>
            <p>{error}</p>
          </div>

        ) : applications.length === 0 ? (
          <div className="no-applications">
            <FileText size={45} />
            <h2>No applications yet</h2>
            <p>
              Your submitted job applications will appear here.
            </p>
            <button onClick={onBack}>Explore Jobs</button>
          </div>

        ) : (
          <div className="applications-list">

            {applications.map((application) => (
              <div
                className="application-item"
                key={application.id}
              >
                <div>
                  <h3>{application.job_title}</h3>

                  <p>{application.company}</p>

                  <small>
                    {application.location} · {application.job_type}
                  </small>

                  <br />

                  <small>
                    Applied on: {formatDate(application.applied_at)}
                  </small>
                </div>

                <div className="application-status">
                  {getStatusIcon(application.status)}
                  <span>{application.status}</span>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyApplications;
