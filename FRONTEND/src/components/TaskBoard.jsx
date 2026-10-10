
import api from "../services/api";
import TaskCard from "./TaskCard";

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "In Review" },
  { id: "completed", title: "Completed" },
];

export default function TaskBoard({ tasks = [], onTaskUpdated }) {
  async function updateStatus(taskId, status) {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      await onTaskUpdated?.();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update task.");
    }
  }

  return (
    <div className="task-board">
      {columns.map((column) => (
        <section className="task-column" key={column.id}>
          <div className="column-heading">
            <h3>{column.title}</h3>
            <span className="count">
              {tasks.filter((task) => task.status === column.id).length}
            </span>
          </div>

          <div className="task-list">
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <div key={task._id}>
                  <TaskCard task={task} />

                  <select
                    aria-label={`Change status for ${task.title}`}
                    className="status-select"
                    value={task.status}
                    onChange={(event) =>
                      updateStatus(task._id, event.target.value)
                    }
                  >
                    {columns.map((option) => (
                      <option key={option.id} value={option.id}>
                        Move to {option.title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

            {tasks.filter((task) => task.status === column.id).length === 0 && (
              <p className="empty-column">No tasks yet</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}