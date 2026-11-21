
import { useState } from "react";
import { ArrowLeft, Upload, FileText } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

function Application({ job, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [education, setEducation] = useState("");
  const [coverMessage, setCoverMessage] = useState("");
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!job) {
      alert("Job details are not available.");
      return;
    }

    const token = localStorage.getItem("nearbyJobsToken");

    if (!token) {
      alert("Please log in before applying for a job.");
      return;
    }

    if (!resume) {
      alert("Please upload your PDF resume.");
      return;
    }

    const formData = new FormData();

    formData.append("full_name", name);
    formData.append("email", email);
    formData.append("mobile", mobile);
    formData.append("education", education);
    formData.append("cover_message", coverMessage);
    formData.append("resume", resume);

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs/${job.id}/apply/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.detail ||
          JSON.stringify(data);

        throw new Error(errorMessage);
      }

      alert(
        data.message ||
        "Your application has been submitted successfully!"
      );

      onBack();

    } catch (error) {
      console.error("Application submission error:", error);

      alert(
        error.message ||
        "Unable to submit your application. Please try again."
      );

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="application-page">
      <div className="application-card">

        <button
          className="auth-back"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={18} /> Back to Job Details
        </button>

        <h1>Apply for this Job</h1>

        <p className="application-job-title">
          {job?.title || "Job Application"}
        </p>

        <p className="application-company">
          {job?.company || job?.companyName || ""}
        </p>

        <form onSubmit={handleSubmit}>

          <label>Full Name *</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email Address *</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Mobile Number *</label>
          <input
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />

          <label>Education *</label>
          <input
            type="text"
            placeholder="Example: B.Tech CSE"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            required
          />

          <label>Resume (PDF) *</label>

          <label className="resume-upload">
            <Upload size={20} />

            <span>
              {resume ? resume.name : "Choose your resume PDF"}
            </span>

            <input
              type="file"
              accept=".pdf,application/pdf"
              required
              onChange={(e) => {
                const selectedFile =
                  e.target.files?.[0] || null;

                if (
                  selectedFile &&
                  selectedFile.type !== "application/pdf"
                ) {
                  alert("Please select a PDF resume.");
                  e.target.value = "";
                  setResume(null);
                  return;
                }

                setResume(selectedFile);
              }}
            />
          </label>

          {resume && (
            <p className="resume-selected">
              <FileText size={16} /> {resume.name}
            </p>
          )}

          <label>Cover Message</label>

          <textarea
            rows="4"
            placeholder="Tell the employer why you are suitable for this job..."
            value={coverMessage}
            onChange={(e) => setCoverMessage(e.target.value)}
          />

          <button
            className="auth-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : "Submit Application"}
          </button>

          <p className="application-note">
            Your application and PDF resume will be submitted
            securely to the Nearby Jobs server.
          </p>

        </form>
      </div>
    </div>
  );
}

export default Application;
