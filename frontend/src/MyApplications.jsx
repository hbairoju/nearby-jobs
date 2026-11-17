
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

function MyApplications({ onBack }) {
  // Applications will be loaded from browser storage
  const applications = JSON.parse(
    localStorage.getItem("nearbyJobsApplications") || "[]"
  );

  function getStatusIcon(status) {
    if (status === "Shortlisted") return <CheckCircle size={18} />;
    if (status === "Rejected") return <XCircle size={18} />;
    return <Clock size={18} />;
  }

  return (
    <div className="applications-dashboard">
      <div className="applications-container">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>

        <h1>My Applications</h1>
        <p>Track the jobs you have applied for.</p>

        {applications.length === 0 ? (
          <div className="no-applications">
            <FileText size={45} />
            <h2>No applications yet</h2>
            <p>Your submitted job applications will appear here.</p>
            <button onClick={onBack}>Explore Jobs</button>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div className="application-item" key={application.id}>
                <div>
                  <h3>{application.jobTitle}</h3>
                  <p>{application.company}</p>
                  <small>Applied on: {application.date}</small>
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
