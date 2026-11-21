import { useEffect, useState } from "react";
import Application from "./Application";
import Profile from "./Profile";
import Register from "./Register";
import Login from "./Login";
import MyApplications from "./MyApplications";
import SavedJobs from "./SavedJobs";
import CompanyDashboard from "./CompanyDashboard";
import AdminDashboard from "./AdminDashboard";

import {
  Search,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  Laptop,
  Clock,
  ArrowRight,
  Menu,
  ShieldCheck,
  Building2,
  Bookmark,
  Users,
  ArrowLeft
} from "lucide-react";

import "./App.css";

// JOB CATEGORIES
const categories = [
  { name: "Part-time Jobs", icon: Clock },
  { name: "Internships", icon: GraduationCap },
  { name: "Work from Home", icon: Laptop },
  { name: "Full-time Jobs", icon: BriefcaseBusiness },
  { name: "Freelancing", icon: Users }
];

// SAMPLE JOBS
const sampleJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "Tech Solutions",
    city: "Hyderabad",
    type: "Internships",
    salary: "₹12,000/month",
    duration: "3–6 months",
    experience: "Fresher",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    description:
      "Learn and work on modern web applications with our development team.",
    requirements: "HTML, CSS, JavaScript and React basics.",
    responsibilities: [
      "Build responsive website interfaces.",
      "Work with HTML, CSS and JavaScript.",
      "Assist senior developers with projects.",
      "Test and improve website performance."
    ]
  },
  {
    id: 2,
    title: "Part-time Customer Support",
    company: "Bright Services",
    city: "Warangal",
    type: "Part-time Jobs",
    salary: "₹10,000/month",
    duration: "Part-time",
    experience: "Fresher",
    skills: [
      "Communication",
      "Customer Service",
      "Basic Computer Skills"
    ],
    description:
      "Help customers with their questions and provide support.",
    requirements: "Good communication skills.",
    responsibilities: [
      "Answer customer questions.",
      "Resolve basic customer issues.",
      "Maintain customer records.",
      "Communicate professionally."
    ]
  },
  {
    id: 3,
    title: "Junior Python Developer",
    company: "Digital Works",
    city: "Pune",
    type: "Full-time Jobs",
    salary: "₹3–5 LPA",
    duration: "Full-time",
    experience: "0–1 years",
    skills: ["Python", "Django", "SQL", "Git"],
    description:
      "Assist in developing and maintaining Python-based applications.",
    requirements: "Python basics and problem-solving skills.",
    responsibilities: [
      "Write clean Python code.",
      "Develop backend features.",
      "Work with databases.",
      "Debug and test applications."
    ]
  },
  {
    id: 4,
    title: "Remote Content Writer",
    company: "Creative Hub",
    city: "Remote",
    type: "Work from Home",
    salary: "₹15,000/month",
    duration: "Remote",
    experience: "Fresher",
    skills: ["Writing", "English", "Research", "SEO"],
    description:
      "Create engaging content for websites, blogs and social media.",
    requirements: "Good writing and research skills.",
    responsibilities: [
      "Write articles and blog posts.",
      "Research assigned topics.",
      "Edit and proofread content.",
      "Follow content guidelines."
    ]
  },
  {
    id: 5,
    title: "Graphic Design Freelancer",
    company: "Pixel Studio",
    city: "Mumbai",
    type: "Freelancing",
    salary: "Project based",
    duration: "Project based",
    experience: "Portfolio preferred",
    skills: ["Canva", "Photoshop", "Graphic Design"],
    description:
      "Create attractive graphics for digital marketing and branding.",
    requirements: "Graphic design skills and a portfolio.",
    responsibilities: [
      "Design social media graphics.",
      "Create promotional posters.",
      "Follow brand guidelines.",
      "Deliver projects on time."
    ]
  }
];

// POPULAR CITIES
const cities = [
  "Hyderabad",
  "Warangal",
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Pune",
  "Vijayawada"
];

// CONVERT COMPANY JOB TYPES TO WEBSITE CATEGORIES
function formatJobType(type) {
  const types = {
    "Full-time": "Full-time Jobs",
    "Part-time": "Part-time Jobs",
    "Internship": "Internships",
    "Work from Home": "Work from Home",
    "Freelancing": "Freelancing"
  };

  return types[type] || type;
}

// LOAD ONLY ADMIN-APPROVED COMPANY JOBS
function loadApprovedCompanyJobs() {
  try {
    const savedJobs = JSON.parse(
      localStorage.getItem("nearbyJobsCompanyPosts") || "[]"
    );

    return savedJobs
      .filter(job => job.status === "Approved")
      .map(job => ({
        ...job,
        company: job.companyName || "Verified Company",
        city: job.location || "Location not provided",
        type: formatJobType(job.type),
        duration: job.duration || job.type || "Not specified",
        experience: job.experience || "Not specified",
        skills: Array.isArray(job.skills) ? job.skills : [],
        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities
          : [],
        requirements: job.requirements || "Not specified"
      }));
  } catch (error) {
    console.error("Could not load company jobs:", error);
    return [];
  }
}

function App() {
  // SEARCH STATES
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");

  // NAVIGATION STATES
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [showApplication, setShowApplication] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMyApplications, setShowMyApplications] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const [showCompanyDashboard, setShowCompanyDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
const [apiJobs, setApiJobs] = useState([]);
const [jobsLoading, setJobsLoading] = useState(true);
const [jobsError, setJobsError] = useState("");
const [loggedInUser, setLoggedInUser] = useState(() => {
  const token = localStorage.getItem("nearbyJobsToken");

  if (!token) return null;

  return {
    token,
    accountType: localStorage.getItem("nearbyJobsAccountType"),
    email: localStorage.getItem("nearbyJobsEmail")
  };
});

// FETCH APPROVED JOBS FROM THE DJANGO BACKEND
useEffect(() => {
  let cancelled = false;

  async function fetchJobs() {
    try {
      setJobsLoading(true);
      setJobsError("");

const apiBaseUrl = (
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"
      ).replace(/\/+$/, "");

      const response = await fetch(`${apiBaseUrl}/api/jobs/`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected response.");
      }

      const formattedJobs = data.map(job => ({
        ...job,
        id: job.id,
        title: job.title || "Untitled job",
        company: job.company || "Company not provided",
        city: job.location || "Location not provided",
        type: formatJobType(job.job_type || "Other"),
        salary: job.salary || "Not specified",
        duration: job.duration || "Not specified",
        experience: job.experience || "Not specified",
        skills: Array.isArray(job.skills) ? job.skills : [],
        responsibilities: Array.isArray(job.responsibilities)
          ? job.responsibilities
          : [],
        description: job.description || "No description provided.",
        requirements: job.requirements || "Not specified",
        is_verified: Boolean(job.is_verified)
      }));

      if (!cancelled) {
        setApiJobs(formattedJobs);
      }
    } catch (error) {
      console.error("Failed to load jobs from Django:", error);

      if (!cancelled) {
        setJobsError(
          "Unable to load jobs from the server. Please check that the Django backend is running."
        );
      }
    } finally {
      if (!cancelled) {
        setJobsLoading(false);
      }
    }
  }

  fetchJobs();

  return () => {
    cancelled = true;
  };
}, []);
  // LOAD APPROVED COMPANY JOBS
  const [companyJobs, setCompanyJobs] = useState(
    loadApprovedCompanyJobs
  );

  // PUBLIC JOB LIST: LOAD JOBS FROM THE DJANGO DATABASE
  const jobs = apiJobs;

  // REFRESH COMPANY JOBS AFTER RETURNING FROM DASHBOARDS
  function refreshCompanyJobs() {
    setCompanyJobs(loadApprovedCompanyJobs());
  }

  // SAVED JOBS
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("nearbyJobsSaved") || "[]"
      );
    } catch {
      return [];
    }
  });

  // FILTER JOBS
  const filteredJobs = jobs.filter(job =>
    `${job.title} ${job.company} ${(job.skills || []).join(" ")} ${job.requirements || ""}`
      .toLowerCase()
      .includes(keyword.toLowerCase()) &&
    (job.city || "").toLowerCase().includes(location.toLowerCase()) &&
    (category === "All" || job.type === category)
  );

  // SCROLL TO JOBS
  function scrollToJobs() {
    document.getElementById("jobs")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  // OPEN JOB DETAILS
  function openJob(job) {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // BACK TO HOME
  function goBack() {
    setSelectedJob(null);
    setShowApplication(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
function handleLogout() {
  localStorage.removeItem("nearbyJobsToken");
  localStorage.removeItem("nearbyJobsAccountType");
  localStorage.removeItem("nearbyJobsEmail");

  setLoggedInUser(null);
  setShowLogin(false);
  setShowRegister(false);

  alert("You have logged out successfully.");
}
  // SAVE / REMOVE JOB
  function toggleSave(id) {
    setSavedJobs(old => {
      const updated = old.includes(id)
        ? old.filter(savedId => savedId !== id)
        : [...old, id];

      localStorage.setItem(
        "nearbyJobsSaved",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  // REMOVE SAVED JOB
  function removeSavedJob(id) {
    setSavedJobs(old => {
      const updated = old.filter(savedId => savedId !== id);

      localStorage.setItem(
        "nearbyJobsSaved",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  // ADMIN DASHBOARD
  if (showAdminDashboard) {
    return (
      <AdminDashboard
        onBack={() => {
          refreshCompanyJobs();
          setShowAdminDashboard(false);
        }}
      />
    );
  }

  // COMPANY DASHBOARD
  if (showCompanyDashboard) {
    return (
      <CompanyDashboard
        onBack={() => {
          refreshCompanyJobs();
          setShowCompanyDashboard(false);
        }}
      />
    );
  }

  // SAVED JOBS
  if (showSavedJobs) {
    return (
      <SavedJobs
        jobs={jobs}
        savedJobs={savedJobs}
        onBack={() => setShowSavedJobs(false)}
        onOpenJob={(job) => {
          setSelectedJob(job);
          setShowSavedJobs(false);
        }}
        onRemove={removeSavedJob}
      />
    );
  }

  // MY PROFILE
  if (showProfile) {
    return (
      <Profile
        onBack={() => setShowProfile(false)}
      />
    );
  }

  // MY APPLICATIONS
  if (showMyApplications) {
    return (
      <MyApplications
        onBack={() => setShowMyApplications(false)}
      />
    );
  }

  // APPLICATION PAGE
  if (showApplication && selectedJob) {
    return (
      <Application
        job={selectedJob}
        onBack={() => setShowApplication(false)}
      />
    );
  }

  // LOGIN PAGE
  if (showLogin) {
    return (
    <Login
  onBack={() => setShowLogin(false)}
  onLogin={(user) => setLoggedInUser(user)}
  onRegister={() => {
    setShowLogin(false);
    setShowRegister(true);
  }}
/>
    );
  }

  // REGISTER PAGE
  if (showRegister) {
    return (
      <Register
        onBack={() => setShowRegister(false)}
        onLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    );
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">

        <a href="#home" className="brand" onClick={goBack}>
          <span className="brand-icon">
            <BriefcaseBusiness />
          </span>

          <span>
            Nearby<span className="brand-blue">Jobs</span>
          </span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <Menu />
        </button>

        <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={goBack}>Home</a>
          <a href="#jobs" onClick={goBack}>Find Jobs</a>
          <a href="#categories" onClick={goBack}>Categories</a>
          <a href="#cities" onClick={goBack}>Locations</a>
        </nav>

        <div className="nav-actions">

          {loggedInUser ? (
  <>
    <span className="login-btn">
      {loggedInUser.email}
      {" ("}
      {loggedInUser.accountType === "company"
        ? "Company"
        : "Job Seeker"}
      {")"}
    </span>
        {loggedInUser.accountType === "company" && (
  <button
    className="register-btn"
    onClick={() => setShowCompanyDashboard(true)}
  >
    Company Dashboard
  </button>
)}
{loggedInUser.accountType === "jobseeker" && (
  <button
    className="register-btn"
    onClick={() => {
      setShowMyApplications(true);
      setMobileMenu(false);
    }}
  >
    My Applications
  </button>
)}
    <button className="register-btn" onClick={handleLogout}>
      Logout
    </button>
  </>
) : (
  <>
    <button
      className="login-btn"
      onClick={() => setShowLogin(true)}
    >
      Login
    </button>

    <button
      className="register-btn"
      onClick={() => setShowRegister(true)}
    >
      Register
    </button>
  </>
)}

        </div>
      </header>

      {/* JOB DETAILS */}
      {selectedJob ? (

        <main className="job-details-page">

          <button className="back-btn" onClick={goBack}>
            <ArrowLeft size={18} /> Back to Jobs
          </button>

          <div className="details-layout">

            <div className="details-main">

              <div className="details-header">
                <div className="company-icon">
                  <Building2 />
                </div>

                <div>
                  <h1>{selectedJob.title}</h1>
                  <p>{selectedJob.company}</p>
                </div>
              </div>

              <div className="details-meta">
                <span>
                  <MapPin size={17} /> {selectedJob.city}
                </span>

                <span>
                  <BriefcaseBusiness size={17} /> {selectedJob.type}
                </span>

                <span>
                  <Clock size={17} /> {selectedJob.duration || "Not specified"}
                </span>
              </div>

              <section className="details-section">
                <h2>Job Description</h2>
                <p>{selectedJob.description}</p>
              </section>

              <section className="details-section">
                <h2>Responsibilities</h2>

                {selectedJob.responsibilities?.length > 0 ? (
                  <ul>
                    {selectedJob.responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>See the job requirements for more information.</p>
                )}
              </section>

              <section className="details-section">
                <h2>Required Skills</h2>

                {selectedJob.skills?.length > 0 ? (
                  <div className="skill-list">
                    {selectedJob.skills.map(skill => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p>Refer to the requirements below.</p>
                )}
              </section>

              <section className="details-section">
                <h2>Requirements</h2>
                <p>{selectedJob.requirements || "Not specified."}</p>
              </section>

              <section className="details-section">
                <h2>Eligibility</h2>
                <p>
                  Experience: {selectedJob.experience || "Not specified"}
                </p>
              </section>

            </div>

            <aside className="details-sidebar">

              <span className="section-label">
                JOB INFORMATION
              </span>

              <h2>{selectedJob.salary}</h2>
              <p>Salary / Compensation</p>

              <div className="sidebar-info">
                <span>Company</span>
                <strong>{selectedJob.company}</strong>
              </div>

              <div className="sidebar-info">
                <span>Location</span>
                <strong>{selectedJob.city}</strong>
              </div>

              <div className="sidebar-info">
                <span>Job type</span>
                <strong>{selectedJob.type}</strong>
              </div>

              <button
                className="apply-btn"
                onClick={() => setShowApplication(true)}
              >
                Apply Now <ArrowRight size={18} />
              </button>

              <button
                className="save-details-btn"
                onClick={() => toggleSave(selectedJob.id)}
              >
                <Bookmark
                  size={18}
                  fill={
                    savedJobs.includes(selectedJob.id)
                      ? "currentColor"
                      : "none"
                  }
                />

                {savedJobs.includes(selectedJob.id)
                  ? "Saved Job"
                  : "Save Job"}
              </button>

              <div className="safety-note">
                <ShieldCheck size={20} />

                <p>
                  Always verify the employer before sharing personal
                  information or accepting an offer.
                </p>
              </div>

            </aside>
          </div>
        </main>

      ) : (

        <main>

          {/* HERO SECTION */}
          <section className="hero" id="home">

            <div className="hero-content">

              <span className="eyebrow">
                <ShieldCheck size={16} />
                Opportunities across India
              </span>

              <h1>
                Find the right job.<br />
                <span>Build your future.</span>
              </h1>

              <p>
                Discover internships, part-time jobs and career opportunities
                near you. Your next opportunity starts here.
              </p>

              <div className="search-box">

                <div className="search-field">
                  <Search />

                  <input
                    placeholder="Job title or keyword"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                  />
                </div>

                <div className="search-field">
                  <MapPin />

                  <input
                    placeholder="Enter city"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                <button className="search-btn" onClick={scrollToJobs}>
                  Search Jobs
                </button>

              </div>

              <div className="popular-search">
                Popular:
                <span>Internships</span>
                <span>Part-time</span>
                <span>Work from home</span>
              </div>

            </div>
          </section>

          {/* CATEGORIES */}
          <section className="section" id="categories">

            <div className="section-heading">
              <div>
                <span className="section-label">
                  EXPLORE OPPORTUNITIES
                </span>

                <h2>Browse by category</h2>
                <p>Find opportunities that match your interests.</p>
              </div>
            </div>

            <div className="category-grid">

              {categories.map(item => {
                const Icon = item.icon;

                return (
                  <button
                    className="category-card"
                    key={item.name}
                    onClick={() => {
                      setCategory(item.name);
                      scrollToJobs();
                    }}
                  >
                    <span className="category-icon">
                      <Icon />
                    </span>

                    <strong>{item.name}</strong>
                    <small>Explore opportunities</small>

                    <ArrowRight
                      className="category-arrow"
                      size={18}
                    />
                  </button>
                );
              })}

            </div>
          </section>

          {/* JOB LIST */}
          <section className="section jobs-section" id="jobs">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  FRESH OPPORTUNITIES
                </span>

                <h2>Latest job openings</h2>
                <p>
                  Explore {jobs.length} opportunities from different cities.
                </p>
              </div>

              <button
                className="clear-btn"
                onClick={() => {
                  setKeyword("");
                  setLocation("");
                  setCategory("All");
                }}
              >
                Clear filters
              </button>

            </div>

            <div className="job-list">

              {jobsLoading && (
                <div className="empty-state">
                  Loading jobs from the server...
                </div>
              )}

              {!jobsLoading && jobsError && (
                <div className="empty-state">
                  {jobsError}
                </div>
              )}

              {!jobsLoading && !jobsError && filteredJobs.map(job => (

                <article className="job-card" key={job.id}>

                  <div className="company-icon">
                    <Building2 />
                  </div>

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
                  </div>

                  <div className="job-right">
                    <strong>{job.salary}</strong>

                    <button
                      className="details-btn"
                      onClick={() => openJob(job)}
                    >
                      View details <ArrowRight size={15} />
                    </button>
                  </div>

                  <button
                    className="bookmark-btn"
                    aria-label="Save job"
                    onClick={() => toggleSave(job.id)}
                  >
                    <Bookmark
                      size={19}
                      fill={
                        savedJobs.includes(job.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                </article>

              ))}

              {!jobsLoading && !jobsError && filteredJobs.length === 0 && (
                <div className="empty-state">
                  No approved jobs found. Please check again later.
                </div>
              )}

            </div>
          </section>

          {/* CITIES */}
          <section className="section cities-section" id="cities">

            <span className="section-label">
              FIND JOBS BY LOCATION
            </span>

            <h2>Popular cities in India</h2>

            <p>Explore opportunities in your preferred city.</p>

            <div className="city-grid">

              {cities.map(city => (

                <button
                  key={city}
                  onClick={() => {
                    setLocation(city);
                    scrollToJobs();
                  }}
                >
                  <MapPin size={17} />
                  {city}
                  <ArrowRight size={15} />
                </button>

              ))}

            </div>
          </section>

          {/* TRUST SECTION */}
          <section className="trust-section">

            <ShieldCheck size={34} />

            <div>
              <h2>Your safety matters to us.</h2>

              <p>
                We're building a platform focused on verified employers
                and safer job opportunities.
              </p>
            </div>

          </section>

        </main>
      )}

      {/* FOOTER */}
      <footer>

        <a href="#home" className="brand" onClick={goBack}>
          <span className="brand-icon">
            <BriefcaseBusiness />
          </span>

          <span>
            Nearby<span className="brand-blue">Jobs</span>
          </span>
        </a>

        <p>Find opportunities. Build your future.</p>

        <small>
          © 2026 Nearby Jobs. All rights reserved.
        </small>

      </footer>

    </div>
  );
}

export default App;
