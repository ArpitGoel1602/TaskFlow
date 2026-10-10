
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTask = useCallback(async () => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      const loadedTask = data.task || data;
      setTask(loadedTask);

      // fetch project members so we can populate the assign dropdown
      if (loadedTask.projectId) {
        const projectId =
          typeof loadedTask.projectId === "object"
            ? loadedTask.projectId._id
            : loadedTask.projectId;
        try {
          const { data: projectData } = await api.get(`/projects/${projectId}`);
          setProjectMembers((projectData.project || projectData).members || []);
        } catch {
          setProjectMembers([]);
        }
      }

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load task.");
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    try {
      const { data } = await api.get(`/tasks/${id}/comments`);
      setComments(data.comments || data);
    } catch {
      setComments([]);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
    loadComments();
  }, [loadTask, loadComments]);

  async function updateTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/tasks/${id}`, {
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?._id || task.assignedTo || null,
      });
      await loadTask();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update task.");
    } finally {
      setSaving(false);
    }
  }

  async function addComment(event) {
    event.preventDefault();

    if (!commentText.trim()) return;

    try {
      await api.post(`/tasks/${id}/comments`, {
        text: commentText.trim(),
      });

      setCommentText("");
      await loadComments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add comment.");
    }
  }

  if (error && !task) {
    return <div className="page"><div className="error-message">{error}</div></div>;
  }

  if (!task) return <p className="page-message">Loading task...</p>;

  return (
    <div className="page details-page">
      <Link to="/projects" className="back-link">← Back to projects</Link>

      <p className="eyebrow">TASK DETAILS</p>
      <h1>{task.title}</h1>
      <p className="muted">
        {task.description || "No description provided."}
      </p>

      {error && <div className="error-message">{error}</div>}

      <form className="create-form" onSubmit={updateTask}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={task.status}
          onChange={(e) =>
            setTask({ ...task, status: e.target.value })
          }
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="completed">Completed</option>
        </select>

        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={task.priority}
          onChange={(e) =>
            setTask({ ...task, priority: e.target.value })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label htmlFor="assignedTo">Assigned to</label>
        <select
          id="assignedTo"
          value={task.assignedTo?._id || task.assignedTo || ""}
          onChange={(e) =>
            setTask({
              ...task,
              assignedTo: e.target.value
                ? { _id: e.target.value, name: projectMembers.find((m) => m._id === e.target.value)?.name }
                : null,
            })
          }
        >
          <option value="">Unassigned</option>
          {projectMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <section className="comments-section">
        <h2>Comments</h2>

        <form onSubmit={addComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={2000}
            rows={3}
            required
          />
          <button className="btn btn-primary">Add Comment</button>
        </form>

        {comments.map((comment) => (
          <article className="comment-card" key={comment._id}>
            <strong>{comment.userId?.name || "Team member"}</strong>
            <p>{comment.text}</p>
            <span className="muted">
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleString()
                : ""}
            </span>
          </article>
        ))}

        {comments.length === 0 && (
          <p className="muted">No comments yet.</p>
        )}
      </section>
    </div>
  );
}