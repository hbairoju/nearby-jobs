
import { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  BriefcaseBusiness,
  MapPin
} from "lucide-react";

function AdminDashboard({ onBack }) {
  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("nearbyJobsVerificationRequests") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [jobs, setJobs] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("nearbyJobsCompanyPosts") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [rejectingJobId, setRejectingJobId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // UPDATE COMPANY VERIFICATION STATUS
  function updateCompanyStatus(id, status) {
    const updatedRequests = requests.map((request) =>
      request.id === id
        ? { ...request, status }
        : request
    );

    setRequests(updatedRequests);

    localStorage.setItem(
      "nearbyJobsVerificationRequests",
      JSON.stringify(updatedRequests)
    );

    alert(`Company ${status.toLowerCase()} successfully!`);
  }

  // UPDATE JOB STATUS
  function updateJobStatus(id, status, reason = "") {
    const updatedJobs = jobs.map((job) =>
      job.id === id
        ? {
            ...job,
            status,
            rejectionReason: status === "Rejected" ? reason : "",
            reviewedAt: new Date().toLocaleDateString("en-IN")
          }
        : job
    );

    setJobs(updatedJobs);

    localStorage.setItem(
      "nearbyJobsCompanyPosts",
      JSON.stringify(updatedJobs)
    );

    setRejectingJobId(null);
    setRejectionReason("");

    alert(`Job ${status.toLowerCase()} successfully!`);
  }

  // HANDLE JOB REJECTION
  function handleRejectJob(e, jobId) {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    updateJobStatus(
      jobId,
      "Rejected",
      rejectionReason.trim()
    );
  }

  // COMPANY STATISTICS
  const pendingCompanies = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCompanies = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCompanies = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  // JOB STATISTICS
  const pendingJobs = jobs.filter(
    (job) => job.status === "Pending Admin Approval"
  ).length;

  const approvedJobs = jobs.filter(
    (job) => job.status === "Approved"
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;

  return (
    <div className="auth-page">
      <div className="auth-card admin-dashboard">

        {/* HEADER */}

        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Home
        </button>

        <h1>Admin Dashboard</h1>
        <p>Manage companies, verification and job approvals.</p>

        {/* COMPANY STATISTICS */}

        <h2 className="company-jobs-heading">
          Company Verification Overview
        </h2>

        <div className="dashboard-stats">
          <div>
            <Clock size={24} />
            <h2>{pendingCompanies}</h2>
            <p>Pending</p>
          </div>

          <div>
            <CheckCircle size={24} />
            <h2>{approvedCompanies}</h2>
            <p>Approved</p>
          </div>

          <div>
            <XCircle size={24} />
            <h2>{rejectedCompanies}</h2>
            <p>Rejected</p>
          </div>
        </div>

        {/* COMPANY VERIFICATION REQUESTS */}

        <h2 className="company-jobs-heading">
          <Building2 size={21} /> Company Verification Requests
        </h2>

        {requests.length === 0 ? (
          <div className="empty-state">
            <Building2 size={35} />
            <h3>No verification requests</h3>
            <p>Company requests will appear here.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div className="admin-request" key={request.id}>
              <div className="admin-request-header">
                <Building2 size={25} />

                <div>
                  <h3>{request.companyName}</h3>
                  <span className={`status-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p>
                <strong>Website:</strong>{" "}
                {request.website || "Not provided"}
              </p>
              <p><strong>Address:</strong> {request.address}</p>
              <p><strong>Document:</strong> {request.documentName}</p>
              <p><strong>Submitted:</strong> {request.submittedAt}</p>

              {request.status === "Pending" && (
                <div className="admin-actions">
                  <button
                    className="admin-approve"
                    onClick={() =>
                      updateCompanyStatus(request.id, "Approved")
                    }
                  >
                    <CheckCircle size={16} />
                    Approve Company
                  </button>

                  <button
                    className="admin-reject"
                    onClick={() =>
                      updateCompanyStatus(request.id, "Rejected")
                    }
                  >
                    <XCircle size={16} />
                    Reject Company
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* JOB STATISTICS */}

        <h2 className="company-jobs-heading">
          Job Approval Overview
        </h2>

        <div className="dashboard-stats">
          <div>
            <Clock size={24} />
            <h2>{pendingJobs}</h2>
            <p>Pending Jobs</p>
          </div>

          <div>
            <CheckCircle size={24} />
            <h2>{approvedJobs}</h2>
            <p>Approved Jobs</p>
          </div>

          <div>
            <XCircle size={24} />
            <h2>{rejectedJobs}</h2>
            <p>Rejected Jobs</p>
          </div>
        </div>

        {/* JOB POSTING APPROVALS */}

        <h2 className="company-jobs-heading">
          <BriefcaseBusiness size={21} /> Job Posting Requests
        </h2>

        {jobs.filter(
          (job) => job.status === "Pending Admin Approval"
        ).length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={35} />
            <h3>No pending job requests</h3>
            <p>Submitted job postings will appear here.</p>
          </div>
        ) : (
          jobs
            .filter((job) => job.status === "Pending Admin Approval")
            .map((job) => (
              <div className="admin-request" key={job.id}>
                <div className="admin-request-header">
                  <BriefcaseBusiness size={25} />

                  <div>
                    <h3>{job.title}</h3>
                    <span className="status-pending">
                      Pending Admin Approval
                    </span>
                  </div>
                </div>

                <p>
                  <strong>Company:</strong>{" "}
                  {job.companyName || "Not provided"}
                </p>

                <p>
                  <strong>Company Email:</strong>{" "}
                  {job.companyEmail || "Not provided"}
                </p>

                <p>
                  <MapPin size={15} /> {job.location}
                </p>

                <p><strong>Job Type:</strong> {job.type}</p>
                <p><strong>Salary:</strong> {job.salary}</p>

                <p>
                  <strong>Description:</strong>
                  <br />
                  {job.description}
                </p>

                <p>
                  <strong>Requirements:</strong>
                  <br />
                  {job.requirements}
                </p>

                <p><strong>Submitted:</strong> {job.submittedAt}</p>

                <div className="admin-actions">
                  <button
                    className="admin-approve"
                    onClick={() =>
                      updateJobStatus(job.id, "Approved")
                    }
                  >
                    <CheckCircle size={16} />
                    Approve Job
                  </button>

                  <button
                    className="admin-reject"
                    onClick={() => {
                      setRejectingJobId(job.id);
                      setRejectionReason("");
                    }}
                  >
                    <XCircle size={16} />
                    Reject Job
                  </button>
                </div>

                {/* REJECTION REASON FORM */}

                {rejectingJobId === job.id && (
                  <form
                    className="company-job-form"
                    onSubmit={(e) => handleRejectJob(e, job.id)}
                  >
                    <h3>Reason for Rejection</h3>

                    <label>Explain why this job is rejected</label>

                    <textarea
                      value={rejectionReason}
                      onChange={(e) =>
                        setRejectionReason(e.target.value)
                      }
                      placeholder="Example: Salary details are missing. Please provide the salary range."
                      rows={4}
                      required
                    />

                    <div className="admin-actions">
                      <button
                        type="submit"
                        className="admin-reject"
                      >
                        Confirm Rejection
                      </button>

                      <button
                        type="button"
                        className="clear-btn"
                        onClick={() => {
                          setRejectingJobId(null);
                          setRejectionReason("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
        )}

        {/* ALL JOB POSTINGS */}

        <h2 className="company-jobs-heading">
          All Company Job Postings
        </h2>

        {jobs.length === 0 ? (
          <p>No company job postings available.</p>
        ) : (
          jobs.map((job) => (
            <div className="admin-request" key={job.id}>
              <h3>{job.title}</h3>
              <p>
                {job.companyName || "Company"} · {job.location}
              </p>
              <p>
                Status: <strong>{job.status}</strong>
              </p>

              {job.rejectionReason && (
                <p>
                  <strong>Rejection Reason:</strong>{" "}
                  {job.rejectionReason}
                </p>
              )}
            </div>
          ))
        )}

        <p className="company-note">
          This is a frontend demonstration using browser localStorage.
          Real admin authentication, secure document review and
          server-side job approval will be implemented with the backend.
        </p>

      </div>
    </div>
  );
}

export default AdminDashboard;
