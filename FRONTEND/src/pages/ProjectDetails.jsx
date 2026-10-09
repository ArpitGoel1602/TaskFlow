
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import TaskBoard from "../components/TaskBoard";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async () => {
    try {
      const [projectResponse, taskResponse] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);

      setProject(projectResponse.data.project || projectResponse.data);
      setTasks(taskResponse.data.tasks || taskResponse.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  async function createTask(event) {
    event.preventDefault();
    setError("");

    try {
      await api.post(`/projects/${id}/tasks`, {
        title,
        description,
        priority,
        ...(dueDate ? { dueDate } : {}),
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      await loadProject();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create task.");
    }
  }

  if (loading) return <p className="page-message">Loading project...</p>;

  if (error && !project) {
    return <div className="page"><div className="error-message">{error}</div></div>;
  }

  if (!project) return <p className="page-message">Project not found.</p>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">PROJECT DETAILS</p>
          <h1>{project.name}</h1>
          <p className="muted">{project.description}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="create-form" onSubmit={createTask}>
        <h2>Create a Task</h2>

        <label htmlFor="taskTitle">Task title</label>
        <input
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement Login API"
          maxLength={150}
          required
        />

        <label htmlFor="taskDescription">Description</label>
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <label htmlFor="taskPriority">Priority</label>
        <select
          id="taskPriority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label htmlFor="taskDueDate">Due date</label>
        <input
          id="taskDueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button className="btn btn-primary">Add Task</button>
      </form>

      <div className="section-heading">
        <h2>Task Board</h2>
        <span className="muted">{tasks.length} tasks</span>
      </div>

      <TaskBoard tasks={tasks} onTaskUpdated={loadProject} />
    </div>
  );
}