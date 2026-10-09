
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Clock3,
  CircleCheck,
  Plus,
} from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [projectResponse, dashboardResponse] = await Promise.all([
          api.get("/projects"),
          api.get("/dashboard"),
        ]);

        setProjects(projectResponse.data.projects || projectResponse.data);
        setStats(dashboardResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: CheckSquare,
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CircleCheck,
    },
    {
      title: "Overdue Tasks",
      value: stats.overdueTasks,
      icon: Clock3,
    },
  ];

  if (loading) return <p className="page-message">Loading dashboard...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="muted">Track your projects and team progress.</p>
        </div>

        <Link to="/projects" className="btn btn-primary">
          <Plus size={18} />
          View Projects
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        {cards.map(({ title, value, icon: Icon }) => (
          <div className="stat-card" key={title}>
            <div className="stat-icon"><Icon size={22} /></div>
            <p className="muted">{title}</p>
            <h2>{value ?? 0}</h2>
          </div>
        ))}
      </div>

      <div className="section-heading">
        <h2>Recent Projects</h2>
        <Link to="/projects">View all</Link>
      </div>

      <div className="project-grid">
        {projects.slice(0, 4).map((project) => (
          <Link
            to={`/projects/${project._id}`}
            className="project-card"
            key={project._id}
          >
            <div className="project-icon"><FolderKanban size={22} /></div>
            <h3>{project.name}</h3>
            <p className="muted">
              {project.description || "No description available."}
            </p>
          </Link>
        ))}

        {projects.length === 0 && (
          <p className="muted">No projects yet. Create your first project.</p>
        )}
      </div>
    </div>
  );
}