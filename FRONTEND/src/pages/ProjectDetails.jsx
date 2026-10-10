
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import TaskBoard from "../components/TaskBoard";
import { useAuth } from "../context/useAuth";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // member management state
  const [memberEmail, setMemberEmail] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberError, setMemberError] = useState("");

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
        ...(assignedTo ? { assignedTo } : {}),
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setAssignedTo("");
      await loadProject();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create task.");
    }
  }

  async function searchMembers() {
    if (!memberEmail.trim()) return;
    setMemberSearching(true);
    setMemberError("");
    setMemberSearchResults([]);

    try {
      const { data } = await api.get(`/users/search?email=${encodeURIComponent(memberEmail.trim())}`);
      const results = data.users || [];

      // filter out people already in the project
      const existingIds = new Set((project.members || []).map((m) => m._id));
      setMemberSearchResults(results.filter((u) => !existingIds.has(u._id)));

      if (results.length === 0) {
        setMemberError("No users found with that email.");
      }
    } catch (err) {
      setMemberError(err.response?.data?.message || "Search failed.");
    } finally {
      setMemberSearching(false);
    }
  }

  async function addMember(userId) {
    setMemberError("");
    try {
      await api.post(`/projects/${id}/members`, { userId });
      setMemberEmail("");
      setMemberSearchResults([]);
      await loadProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Could not add member.");
    }
  }

  async function removeMember(userId) {
    setMemberError("");
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      await loadProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Could not remove member.");
    }
  }

  if (loading) return <p className="page-message">Loading project...</p>;

  if (error && !project) {
    return <div className="page"><div className="error-message">{error}</div></div>;
  }

  if (!project) return <p className="page-message">Project not found.</p>;

  const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

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

      {/* Team Members */}
      <div className="section-heading">
        <h2>Team Members</h2>
        <span className="muted">{(project.members || []).length} members</span>
      </div>

      <div className="members-list">
        {(project.members || []).map((member) => (
          <div key={member._id} className="member-item">
            <div className="member-info">
              <span className="member-name">{member.name}</span>
              <span className="member-email muted">{member.email}</span>
            </div>
            {isOwner && project.owner?._id !== member._id && project.owner !== member._id && (
              <button
                className="btn btn-danger-sm"
                onClick={() => removeMember(member._id)}
              >
                Remove
              </button>
            )}
            {(project.owner?._id === member._id || project.owner === member._id) && (
              <span className="badge-owner">Owner</span>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="add-member-form">
          <div className="add-member-row">
            <input
              value={memberEmail}
              onChange={(e) => {
                setMemberEmail(e.target.value);
                setMemberSearchResults([]);
                setMemberError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchMembers())}
              placeholder="Search by email address..."
              type="email"
            />
            <button
              className="btn btn-secondary"
              onClick={searchMembers}
              disabled={memberSearching}
            >
              {memberSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {memberError && <p className="error-message">{memberError}</p>}

          {memberSearchResults.length > 0 && (
            <ul className="search-results">
              {memberSearchResults.map((u) => (
                <li key={u._id} className="search-result-item">
                  <span>{u.name} <span className="muted">({u.email})</span></span>
                  <button className="btn btn-primary-sm" onClick={() => addMember(u._id)}>
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Create Task form */}
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

        <label htmlFor="taskAssignedTo">Assign to</label>
        <select
          id="taskAssignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="">Unassigned</option>
          {(project.members || []).map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>

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
