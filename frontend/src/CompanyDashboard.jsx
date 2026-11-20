
import { useState, useEffect } from "react";
import {
  Building2,
  BriefcaseBusiness,
  PlusCircle,
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Send,
  Pencil,
  Trash2,
  Users
} from "lucide-react";

import CompanyApplications from "./CompanyApplications";

function CompanyDashboard({ onBack }) {
  const [jobs, setJobs] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("nearbyJobsCompanyPosts") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  const [verificationRequest, setVerificationRequest] = useState(() => {
    try {
      const requests = JSON.parse(
        localStorage.getItem("nearbyJobsVerificationRequests") || "[]"
      );

      return requests.length > 0
        ? requests[requests.length - 1]
        : null;
    } catch {
      return null;
    }
  });

  const [verification, setVerification] = useState({
    companyName: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    document: null
  });

  const emptyJob = {
    title: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    requirements: ""
  };

  const [job, setJob] = useState(emptyJob);

const [isVerified, setIsVerified] = useState(false);
useEffect(() => {
  const fetchVerificationStatus = async () => {
    const token = localStorage.getItem("nearbyJobsToken");

    if (!token) return;

    const apiBaseUrl = (
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"
    ).replace(/\/+$/, "");

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/accounts/verification/status/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Could not fetch verification status.");
        return;
      }

      const data = await response.json();

      setIsVerified(data.company_verified);

      setVerificationRequest(
        data.status
          ? {
              companyName: data.company_name,
              email: data.email,
              status: data.status,
              rejectionReason: data.rejection_reason,
            }
          : null
      );
    } catch (error) {
      console.error("Verification status error:", error);
    }
  };

  fetchVerificationStatus();
}, []);
useEffect(() => {
  const fetchCompanyJobs = async () => {
    const token = localStorage.getItem("nearbyJobsToken");

    if (!token || !isVerified) {
      setJobs([]);
      return;
    }

    const apiBaseUrl = (
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"
    ).replace(/\/+$/, "");

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/company/jobs/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Could not load company jobs:", data);
        return;
      }

      const formattedJobs = data.map((item) => ({
        id: item.id,
        title: item.title,
        location: item.location,
        type: item.job_type,
        salary: item.salary,
        description: item.description,
        requirements: item.requirements,
        status: item.status,
        companyName: item.company,
        applicationUrl: item.application_url,
        isVerified: item.is_verified,
      }));

      setJobs(formattedJobs);
      localStorage.setItem(
        "nearbyJobsCompanyPosts",
        JSON.stringify(formattedJobs)
      );
    } catch (error) {
      console.error("Company jobs loading error:", error);
    }
  };

  fetchCompanyJobs();
}, [isVerified]);

  // JOB STATUS COUNTS
  const draftCount = jobs.filter(
    (item) => item.status === "Draft"
  ).length;

  const pendingCount = jobs.filter(
    (item) => item.status === "Pending Admin Approval"
  ).length;

  const approvedCount = jobs.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = jobs.filter(
    (item) => item.status === "Rejected"
  ).length;

  // SAVE JOBS
  function saveJobs(updatedJobs) {
    setJobs(updatedJobs);

    localStorage.setItem(
      "nearbyJobsCompanyPosts",
      JSON.stringify(updatedJobs)
    );
  }

  // VERIFICATION INPUTS
  function handleVerificationChange(e) {
    const { name, value, files } = e.target;

    setVerification((previous) => ({
      ...previous,
      [name]: files ? files[0] : value
    }));
  }

  // SUBMIT COMPANY VERIFICATION
 
async function handleVerificationSubmit(e) {
  e.preventDefault();

  if (!verification.document) {
    alert("Please upload a company document.");
    return;
  }

  const token = localStorage.getItem("nearbyJobsToken");

  if (!token) {
    alert("Please log in to your company account first.");
    return;
  }

  const formData = new FormData();

  formData.append("companyName", verification.companyName);
  formData.append("website", verification.website);
  formData.append("email", verification.email);
  formData.append("phone", verification.phone);
  formData.append("address", verification.address);
  formData.append("document", verification.document);

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(
      `${apiBaseUrl}/api/accounts/verification/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Verification submission failed.");
    }

    const newRequest = {
      companyName: verification.companyName,
      email: verification.email,
      status: data.status
    };

    setVerificationRequest(newRequest);

    alert("Company verification request submitted successfully!");
  } catch (error) {
    alert(error.message || "Unable to connect to the server.");
  }
}

  // JOB INPUTS
  function handleJobChange(e) {
    const { name, value } = e.target;

    setJob((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // RESET JOB FORM
  function resetJobForm() {
    setJob(emptyJob);
    setEditingJobId(null);
    setShowForm(false);
  }

  // CREATE OR UPDATE JOB
  function handleJobSubmit(e) {
    e.preventDefault();

    if (editingJobId !== null) {
      if (!isVerified) {
        alert("Your company must be verified before resubmitting a job.");
        return;
      }

      const updatedJobs = jobs.map((item) =>
        item.id === editingJobId
          ? {
              ...item,
              ...job,
              status: "Pending Admin Approval",
              submittedAt: new Date().toLocaleDateString("en-IN"),
              reviewedAt: null
            }
          : item
      );

      saveJobs(updatedJobs);
      resetJobForm();

      alert("Your updated job has been resubmitted for admin approval!");
      return;
    }

    const newJob = {
      ...job,
      id: Date.now(),
      companyName: verificationRequest?.companyName || "",
      companyEmail: verificationRequest?.email || "",
      status: "Draft",
      date: new Date().toLocaleDateString("en-IN")
    };

    saveJobs([...jobs, newJob]);

    resetJobForm();

    alert("Job saved as draft successfully!");
  }

  // EDIT REJECTED JOB
  function editRejectedJob(item) {
    if (!isVerified) {
      alert("Your company must be verified before resubmitting jobs.");
      return;
    }

    setJob({
      title: item.title || "",
      location: item.location || "",
      type: item.type || "Full-time",
      salary: item.salary || "",
      description: item.description || "",
      requirements: item.requirements || ""
    });

    setEditingJobId(item.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // SUBMIT DRAFT FOR ADMIN APPROVAL
  function submitJobForApproval(jobId) {
    if (!isVerified) {
      alert("Your company must be verified before submitting jobs.");
      return;
    }

    const updatedJobs = jobs.map((item) =>
      item.id === jobId
        ? {
            ...item,
            status: "Pending Admin Approval",
            submittedAt: new Date().toLocaleDateString("en-IN"),
            reviewedAt: null
          }
        : item
    );

    saveJobs(updatedJobs);

    alert("Job submitted successfully for admin approval!");
  }

  // DELETE DRAFT
  function deleteDraft(jobId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this draft?"
    );

    if (!confirmDelete) return;

    const updatedJobs = jobs.filter(
      (item) => item.id !== jobId
    );

    saveJobs(updatedJobs);
  }

  // VERIFICATION MESSAGE
  function getVerificationMessage() {
    if (!verificationRequest) {
      return "Submit your company details to request verification.";
    }

    if (verificationRequest.status === "Pending") {
      return "Your verification request is waiting for admin review.";
    }

    if (verificationRequest.status === "Approved") {
      return "Your company is verified. You can submit job postings for approval.";
    }

    if (verificationRequest.status === "Rejected") {
      return "Your verification request was rejected. You can submit a new request.";
    }

    return "Check your verification status.";
  }

  // OPEN COMPANY APPLICATIONS
  if (showApplications) {
    return (
      <CompanyApplications
        companyEmail={verificationRequest?.email || ""}
        onBack={() => setShowApplications(false)}
      />
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card company-dashboard">

        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Home
        </button>

        <h1>Company Dashboard</h1>
        <p>Manage your company verification and job postings.</p>

        {/* COMPANY VERIFICATION */}

        <div className="company-status">
          {verificationRequest?.status === "Approved" ? (
            <CheckCircle size={25} />
          ) : verificationRequest?.status === "Rejected" ? (
            <XCircle size={25} />
          ) : verificationRequest ? (
            <Clock size={25} />
          ) : (
            <Building2 size={25} />
          )}

          <div>
            <strong>Company Verification</strong>
            <p>{getVerificationMessage()}</p>

            {verificationRequest && (
              <strong>
                Status: {verificationRequest.status}
              </strong>
            )}
          </div>

          <ShieldCheck size={22} />
        </div>

        {/* VERIFICATION FORM */}

        {(!verificationRequest ||
          verificationRequest.status === "Rejected") && (
          <form
            className="company-job-form"
            onSubmit={handleVerificationSubmit}
          >
            <h2>Company Verification Details</h2>

            <label>Registered Company Name</label>
            <input
              name="companyName"
              value={verification.companyName}
              onChange={handleVerificationChange}
              placeholder="Enter registered company name"
              required
            />

            <label>Company Website</label>
            <input
              name="website"
              type="url"
              value={verification.website}
              onChange={handleVerificationChange}
              placeholder="https://example.com"
            />

            <label>Official Email</label>
            <input
              name="email"
              type="email"
              value={verification.email}
              onChange={handleVerificationChange}
              placeholder="company@example.com"
              required
            />

            <label>Contact Number</label>
            <input
              name="phone"
              type="tel"
              value={verification.phone}
              onChange={handleVerificationChange}
              placeholder="Company contact number"
              required
            />

            <label>Company Address</label>
            <textarea
              name="address"
              value={verification.address}
              onChange={handleVerificationChange}
              placeholder="Enter registered company address"
              required
            />

            <label>Upload Company Proof</label>
            <input
              name="document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleVerificationChange}
              required
            />

            <button type="submit" className="auth-submit">
              Submit for Verification
            </button>
          </form>
        )}

        {/* JOB STATISTICS */}

        <div className="dashboard-stats">
          <div>
            <BriefcaseBusiness size={24} />
            <h2>{jobs.length}</h2>
            <p>Total Jobs</p>
          </div>

          <div>
            <Clock size={24} />
            <h2>{draftCount}</h2>
            <p>Draft</p>
          </div>

          <div>
            <Clock size={24} />
            <h2>{pendingCount}</h2>
            <p>Pending</p>
          </div>

          <div>
            <CheckCircle size={24} />
            <h2>{approvedCount}</h2>
            <p>Approved</p>
          </div>

          <div>
            <XCircle size={24} />
            <h2>{rejectedCount}</h2>
            <p>Rejected</p>
          </div>
        </div>

        {/* VIEW APPLICATIONS BUTTON */}

        <button
          type="button"
          className="auth-submit"
          onClick={() => setShowApplications(true)}
        >
          <Users size={18} />
          View Applications
        </button>

        {/* CREATE JOB BUTTON */}

        <button
          className="auth-submit"
          onClick={() => {
            if (showForm) {
              resetJobForm();
            } else {
              setEditingJobId(null);
              setJob(emptyJob);
              setShowForm(true);
            }
          }}
        >
          <PlusCircle size={18} />
          {showForm ? "Close Form" : "Prepare a Job Posting"}
        </button>

        {/* JOB FORM */}

        {showForm && (
          <form
            onSubmit={handleJobSubmit}
            className="company-job-form"
          >
            <h2>
              {editingJobId !== null
                ? "Edit Rejected Job"
                : "New Job Posting"}
            </h2>

            <label>Job Title</label>
            <input
              name="title"
              value={job.title}
              onChange={handleJobChange}
              placeholder="Example: React Developer"
              required
            />

            <label>Job Location</label>
            <input
              name="location"
              value={job.location}
              onChange={handleJobChange}
              placeholder="Example: Hyderabad"
              required
            />

            <label>Job Type</label>
            <select
              name="type"
              value={job.type}
              onChange={handleJobChange}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Work from Home</option>
              <option>Freelancing</option>
            </select>

            <label>Salary</label>
            <input
              name="salary"
              value={job.salary}
              onChange={handleJobChange}
              placeholder="Example: ₹15,000/month"
              required
            />

            <label>Job Description</label>
            <textarea
              name="description"
              value={job.description}
              onChange={handleJobChange}
              placeholder="Describe the job..."
              required
            />

            <label>Requirements</label>
            <textarea
              name="requirements"
              value={job.requirements}
              onChange={handleJobChange}
              placeholder="Skills, education and experience..."
              required
            />

            <button type="submit" className="auth-submit">
              {editingJobId !== null
                ? "Save Changes & Resubmit"
                : "Save Job as Draft"}
            </button>

            <button
              type="button"
              className="clear-btn"
              onClick={resetJobForm}
            >
              Cancel
            </button>
          </form>
        )}

        {/* JOB LIST */}

        <h2 className="company-jobs-heading">
          Your Job Postings
        </h2>

        {jobs.length === 0 ? (
          <p>No job postings yet.</p>
        ) : (
          jobs.map((item) => (
            <div className="saved-job-item" key={item.id}>
              <div>
                <h3>{item.title}</h3>

                <p>
                  {item.location} · {item.type}
                </p>

                <strong>{item.salary}</strong>

                <p>
                  Status: <strong>{item.status}</strong>
                </p>

                {item.submittedAt && (
                  <p>Submitted: {item.submittedAt}</p>
                )}

                {item.reviewedAt && (
                  <p>Reviewed: {item.reviewedAt}</p>
                )}

                {item.status === "Draft" && (
                  <div className="saved-job-actions">
                    <button
                      className="details-btn"
                      onClick={() => submitJobForApproval(item.id)}
                      disabled={!isVerified}
                      title={
                        !isVerified
                          ? "Company verification approval is required"
                          : "Submit job for admin approval"
                      }
                    >
                      <Send size={15} />
                      Submit for Approval
                    </button>

                    <button
                      className="clear-btn"
                      onClick={() => deleteDraft(item.id)}
                    >
                      <Trash2 size={15} />
                      Delete Draft
                    </button>
                  </div>
                )}

                {item.status === "Pending Admin Approval" && (
                  <p>
                    <Clock size={15} /> Waiting for admin approval.
                  </p>
                )}

                {item.status === "Approved" && (
                  <p>
                    <CheckCircle size={15} /> Job approved and published.
                  </p>
                )}

                {item.status === "Rejected" && (
                  <div>
                    <p>
                      <XCircle size={15} /> Job rejected by admin.
                    </p>

                    {item.rejectionReason && (
                      <p>
                        **Admin feedback:** {item.rejectionReason}
                      </p>
                    )}

                    <button
                      className="details-btn"
                      onClick={() => editRejectedJob(item)}
                      disabled={!isVerified}
                    >
                      <Pencil size={15} />
                      Edit & Resubmit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {!isVerified && (
          <p className="company-note">
            You can prepare job drafts now. To submit or resubmit
            jobs, your company must first be verified.
          </p>
        )}

        <p className="company-note">
          Jobs are not published automatically. Admin approval
          is required before a job can appear publicly.
        </p>

      </div>
    </div>
  );
}

export default CompanyDashboard;
