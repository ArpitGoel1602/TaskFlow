
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import api from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProjects() {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects || data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/projects", {
        name,
        description,
        ...(deadline ? { deadline } : {}),
      });

      setName("");
      setDescription("");
      setDeadline("");
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>My Projects</h1>
          <p className="muted">Organize your work in one place.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="create-form" onSubmit={handleCreate}>
        <h2><Plus size={20} /> Create a Project</h2>

        <label htmlFor="projectName">Project name</label>
        <input
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. E-Commerce Website"
          maxLength={100}
          required
        />

        <label htmlFor="projectDescription">Description</label>
        <textarea
          id="projectDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          rows={3}
        />

        <label htmlFor="projectDeadline">Deadline</label>
        <input
          id="projectDeadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Creating..." : "Create Project"}
        </button>
      </form>

      <div className="section-heading">
        <h2>All Projects</h2>
        <span className="muted">{projects.length} projects</span>
      </div>

      {loading ? (
        <p className="page-message">Loading projects...</p>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <Link
              to={`/projects/${project._id}`}
              className="project-card"
              key={project._id}
            >
              <div className="project-icon"><FolderKanban size={22} /></div>
              <h3>{project.name}</h3>
              <p className="muted">
                {project.description || "No description provided."}
              </p>
              <p className="project-deadline">
                {project.deadline
                  ? `Deadline: ${new Date(project.deadline).toLocaleDateString()}`
                  : "No deadline"}
              </p>
            </Link>
          ))}

          {projects.length === 0 && (
            <p className="muted">No projects found. Create your first project above.</p>
          )}
        </div>
      )}
    </div>
  );
}