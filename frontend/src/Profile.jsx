
import { useState } from "react";
import {
  User, GraduationCap, Phone, Mail,
  FileText, Upload, ArrowLeft, Save
} from "lucide-react";

function Profile({ onBack }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    education: "",
    college: "",
    skills: ""
  });

  const [resume, setResume] = useState(null);

  function handleChange(e) {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  }

  function handleSave(e) {
    e.preventDefault();

    localStorage.setItem(
      "nearbyJobsProfile",
      JSON.stringify(profile)
    );

    alert("Profile saved successfully!");
  }

  return (
    <div className="auth-page">
      <div className="auth-card profile-card">

        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>

        <h1>My Profile</h1>
        <p>Complete your profile to improve your job opportunities.</p>

        <form onSubmit={handleSave}>

          <label>Full Name</label>
          <input
            name="name"
            placeholder="Enter your name"
            value={profile.name}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={profile.email}
            onChange={handleChange}
            required
          />

          <label>Mobile Number</label>
          <input
            name="mobile"
            placeholder="Enter mobile number"
            value={profile.mobile}
            onChange={handleChange}
            required
          />

          <label>Education</label>
          <input
            name="education"
            placeholder="Example: B.Tech CSE"
            value={profile.education}
            onChange={handleChange}
            required
          />

          <label>College Name</label>
          <input
            name="college"
            placeholder="Enter college name"
            value={profile.college}
            onChange={handleChange}
          />

          <label>Skills</label>
          <input
            name="skills"
            placeholder="Python, Java, HTML, React..."
            value={profile.skills}
            onChange={handleChange}
          />

          <label>Upload Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setResume(e.target.files[0])}
          />

          {resume && <p>Selected: {resume.name}</p>}

          <button className="auth-submit" type="submit">
            <Save size={18} /> Save Profile
          </button>

        </form>
      </div>
    </div>
  );
}

export default Profile;
