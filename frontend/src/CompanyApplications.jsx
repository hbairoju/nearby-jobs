
import { useState } from "react";
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

function CompanyApplications({ companyEmail, onBack }) {
  const [applications, setApplications] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("nearbyJobsApplications") || "[]"
      );
    } catch {
      return [];
    }
  });

  // SHOW ONLY THIS COMPANY'S APPLICATIONS
  const companyApplications = applications.filter(
    (application) =>
      application.companyEmail?.toLowerCase() ===
      companyEmail?.toLowerCase()
  );

  // UPDATE APPLICATION STATUS
  function updateStatus(applicationId, newStatus) {
    const updatedApplications = applications.map((application) =>
      application.id === applicationId
        ? {
            ...application,
            status: newStatus,
            updatedAt: new Date().toLocaleDateString("en-IN")
          }
        : application
    );

    setApplications(updatedApplications);

    localStorage.setItem(
      "nearbyJobsApplications",
      JSON.stringify(updatedApplications)
    );

    alert(`Application ${newStatus.toLowerCase()} successfully!`);
  }

  const pendingCount = companyApplications.filter(
    (application) => application.status === "Pending"
  ).length;

  const shortlistedCount = companyApplications.filter(
    (application) => application.status === "Shortlisted"
  ).length;

  const rejectedCount = companyApplications.filter(
    (application) => application.status === "Rejected"
  ).length;

  return (
    <div className="auth-page">
      <div className="auth-card company-dashboard">

        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Company Dashboard
        </button>

        <h1>Applications Received</h1>
        <p>Review and manage candidates who applied for your jobs.</p>

        {/* APPLICATION STATISTICS */}

        <div className="dashboard-stats">
          <div>
            <Users size={24} />
            <h2>{companyApplications.length}</h2>
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

        {companyApplications.length === 0 ? (
          <div className="empty-state">
            <Users size={35} />
            <h3>No applications received yet</h3>
            <p>
              Applications for your approved job postings
              will appear here.
            </p>
          </div>
        ) : (
          companyApplications.map((application) => (
            <div className="admin-request" key={application.id}>

              <div className="admin-request-header">
                <Users size={25} />

                <div>
                  <h3>{application.name}</h3>
                  <span
                    className={`status-${application.status.toLowerCase()}`}
                  >
                    {application.status}
                  </span>
                </div>
              </div>

              <p>
                <BriefcaseBusiness size={15} />{" "}
                <strong>Applied for:</strong> {application.jobTitle}
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
                <strong>Education:</strong> {application.education}
              </p>

              <p>
                <strong>Applied on:</strong> {application.date}
              </p>

              <p>
                <strong>Cover Message:</strong>
                <br />
                {application.coverMessage || "No cover message provided."}
              </p>

              <p>
                <FileText size={15} />{" "}
                <strong>Resume:</strong>{" "}
                {application.resumeName || "Not provided"}
              </p>

              {application.updatedAt && (
                <p>
                  <strong>Last Updated:</strong> {application.updatedAt}
                </p>
              )}

              {/* APPLICATION ACTIONS */}

              {application.status !== "Rejected" &&
                application.status !== "Shortlisted" && (
                  <div className="admin-actions">

                    <button
                      className="admin-approve"
                      onClick={() =>
                        updateStatus(application.id, "Shortlisted")
                      }
                    >
                      <CheckCircle size={16} />
                      Shortlist
                    </button>

                    <button
                      className="admin-reject"
                      onClick={() =>
                        updateStatus(application.id, "Rejected")
                      }
                    >
                      <XCircle size={16} />
                      Reject
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

        <p className="company-note">
          Applicant management currently uses browser localStorage.
          Secure access and real resume downloads will be added
          when we build the backend.
        </p>

      </div>
    </div>
  );
}

export default CompanyApplications;
