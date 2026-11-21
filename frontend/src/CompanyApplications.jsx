
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  GraduationCap,
  BriefcaseBusiness,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

function CompanyApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // LOAD APPLICATIONS FROM DJANGO
  useEffect(() => {
    async function fetchApplications() {
      const token = localStorage.getItem("nearbyJobsToken");

      if (!token) {
        setError("Please log in to view applications.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/company/applications/`,
          {
            headers: {
              Authorization: `Token ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
            data.detail ||
            "Unable to load applications."
          );
        }

        setApplications(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error("Company applications error:", err);
        setError(err.message || "Something went wrong.");

      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  // UPDATE STATUS IN DJANGO
  async function updateStatus(applicationId, newStatus) {
    const token = localStorage.getItem("nearbyJobsToken");

    if (!token) {
      alert("Please log in again.");
      return;
    }

    setUpdatingId(applicationId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/applications/${applicationId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.detail ||
          "Unable to update application."
        );
      }

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? { ...application, status: data.status }
            : application
        )
      );

      alert(data.message || "Application status updated!");

    } catch (err) {
      console.error("Status update error:", err);
      alert(err.message || "Unable to update status.");

    } finally {
      setUpdatingId(null);
    }
  }

// SECURE RESUME DOWNLOAD
async function downloadResume(application) {
  const token = localStorage.getItem("nearbyJobsToken");

  if (!token) {
    alert("Please log in again.");
    return;
  }

  setDownloadingId(application.id);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/applications/${application.id}/resume/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

    if (!response.ok) {
      let errorMessage = "Unable to download resume.";

      try {
        const data = await response.json();
        errorMessage = data.error || data.detail || errorMessage;
      } catch {
        // Keep the default error message.
      }

      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = fileURL;
    link.download = application.resume_name || "resume.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(fileURL);

  } catch (err) {
    console.error("Resume download error:", err);
    alert(err.message || "Unable to download resume.");

  } finally {
    setDownloadingId(null);
  }
}

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function getStatusIcon(status) {
    if (status === "Shortlisted") {
      return <CheckCircle size={18} />;
    }

    if (status === "Rejected") {
      return <XCircle size={18} />;
    }

    return <Clock size={18} />;
  }

  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const shortlistedCount = applications.filter(
    (application) => application.status === "Shortlisted"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  return (
    <div className="auth-page">
      <div className="auth-card company-dashboard">

        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Company Dashboard
        </button>

        <h1>Applications Received</h1>

        <p>
          Review and manage candidates who applied for your jobs.
        </p>

        {loading ? (
          <div className="empty-state">
            <p>Loading applications...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <XCircle size={35} />
            <h3>Unable to load applications</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* APPLICATION STATISTICS */}

            <div className="dashboard-stats">
              <div>
                <Users size={24} />
                <h2>{applications.length}</h2>
                <p>Total Applicants</p>
              </div>

              <div>
                <Clock size={24} />
                <h2>{pendingCount}</h2>
                <p>Pending</p>
              </div>

              <div>
                <CheckCircle size={24} />
                <h2>{shortlistedCount}</h2>
                <p>Shortlisted</p>
              </div>

              <div>
                <XCircle size={24} />
                <h2>{rejectedCount}</h2>
                <p>Rejected</p>
              </div>
            </div>

            {/* APPLICANT LIST */}

            <h2 className="company-jobs-heading">
              <Users size={21} /> Applicant Details
            </h2>

            {applications.length === 0 ? (
              <div className="empty-state">
                <Users size={35} />
                <h3>No applications received yet</h3>
                <p>
                  Applications for your approved job postings
                  will appear here.
                </p>
              </div>
            ) : (
              applications.map((application) => (
                <div
                  className="admin-request"
                  key={application.id}
                >

                  <div className="admin-request-header">
                    <Users size={25} />

                    <div>
                      <h3>{application.applicant_name}</h3>

                      <span
                        className={`status-${application.status.toLowerCase()}`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>

                  <p>
                    <BriefcaseBusiness size={15} />{" "}
                    <strong>Applied for:</strong>{" "}
                    {application.job_title}
                  </p>

                  <p>
                    <Mail size={15} />{" "}
                    <strong>Email:</strong> {application.email}
                  </p>

                  <p>
                    <Phone size={15} />{" "}
                    <strong>Mobile:</strong> {application.mobile}
                  </p>

                  <p>
                    <GraduationCap size={15} />{" "}
                    <strong>Education:</strong>{" "}
                    {application.education}
                  </p>

                  <p>
                    <strong>Applied on:</strong>{" "}
                    {formatDate(application.applied_at)}
                  </p>

                  <p>
                    <strong>Cover Message:</strong>
                    <br />
                    {application.cover_message ||
                      "No cover message provided."}
                  </p>

                  <p>
                    <FileText size={15} />{" "}
                    <strong>Resume:</strong>{" "}
                    {application.resume_name || "Not provided"}
                  </p>

                    {application.resume_name && (
                    <button
                      className="admin-approve"
                      disabled={downloadingId === application.id}
                      onClick={() => downloadResume(application)}
                    >
                      <FileText size={16} />
                      {downloadingId === application.id
                        ? "Downloading..."
                        : "Download Resume"}
                    </button>
                  )}


                  {/* APPLICATION ACTIONS */}

                  {application.status === "Pending" && (
                    <div className="admin-actions">

                      <button
                        className="admin-approve"
                        disabled={updatingId === application.id}
                        onClick={() =>
                          updateStatus(
                            application.id,
                            "Shortlisted"
                          )
                        }
                      >
                        <CheckCircle size={16} />
                        {updatingId === application.id
                          ? "Updating..."
                          : "Shortlist"}
                      </button>

                      <button
                        className="admin-reject"
                        disabled={updatingId === application.id}
                        onClick={() =>
                          updateStatus(
                            application.id,
                            "Rejected"
                          )
                        }
                      >
                        <XCircle size={16} />
                        {updatingId === application.id
                          ? "Updating..."
                          : "Reject"}
                      </button>

                    </div>
                  )}

                  {application.status === "Shortlisted" && (
                    <p>
                      <CheckCircle size={16} /> Candidate shortlisted.
                    </p>
                  )}

                  {application.status === "Rejected" && (
                    <p>
                      <XCircle size={16} /> Application rejected.
                    </p>
                  )}

                </div>
              ))
            )}
          </>
        )}

        <p className="company-note">
          Applicant details and status updates are loaded from
          the Nearby Jobs database.
        </p>

      </div>
    </div>
  );
}

export default CompanyApplications;
