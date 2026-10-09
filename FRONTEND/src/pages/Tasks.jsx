import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import api from "../services/api";

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadTasks() {
      try {
        const { data } = await api.get("/tasks");
        setTasks(data.tasks || data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>My Tasks</h1>
          <p className="muted">All tasks assigned to you or created by you.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-bar">
        {["all", "todo", "in_progress", "review", "completed"].map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="section-heading">
        <h2>Tasks</h2>
        <span className="muted">{filtered.length} tasks</span>
      </div>

      {loading ? (
        <p className="page-message">Loading tasks...</p>
      ) : filtered.length === 0 ? (
        <p className="muted">No tasks found.</p>
      ) : (
        <div className="task-list">
          {filtered.map((task) => (
            <Link
              key={task._id}
              to={`/tasks/${task._id}`}
              className="task-list-item"
            >
              <div className="task-list-icon">
                <CheckSquare size={18} />
              </div>
              <div className="task-list-body">
                <span className="task-list-title">{task.title}</span>
                {task.projectId?.name && (
                  <span className="task-list-project">{task.projectId.name}</span>
                )}
              </div>
              <div className="task-list-meta">
                <span className={`badge priority-${task.priority}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
                <span className={`badge status-${task.status}`}>
                  {STATUS_LABELS[task.status]}
                </span>
                {task.dueDate && (
                  <span className="task-list-due">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
