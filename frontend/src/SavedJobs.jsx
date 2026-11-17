
import { ArrowLeft, Bookmark, MapPin, BriefcaseBusiness, ArrowRight } from "lucide-react";

function SavedJobs({ jobs, savedJobs, onBack, onOpenJob, onRemove }) {
  const savedJobList = jobs.filter(job =>
    savedJobs.includes(job.id)
  );

  return (
    <div className="auth-page">
      <div className="auth-card saved-jobs-card">

        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Home
        </button>

        <h1>Saved Jobs</h1>
        <p>Jobs you've bookmarked for later.</p>

        {savedJobList.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={35} />
            <h3>No saved jobs yet</h3>
            <p>Browse jobs and click the bookmark icon to save them.</p>
          </div>
        ) : (
          <div className="saved-job-list">
            {savedJobList.map(job => (
              <div className="saved-job-item" key={job.id}>
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>

                  <div className="job-meta">
                    <span>
                      <MapPin size={14} /> {job.city}
                    </span>
                    <span>
                      <BriefcaseBusiness size={14} /> {job.type}
                    </span>
                  </div>

                  <strong>{job.salary}</strong>
                </div>

                <div className="saved-job-actions">
                  <button
                    className="details-btn"
                    onClick={() => onOpenJob(job)}
                  >
                    View Details <ArrowRight size={15} />
                  </button>

                  <button
                    className="clear-btn"
                    onClick={() => onRemove(job.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default SavedJobs;
