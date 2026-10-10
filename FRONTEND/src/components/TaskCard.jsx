
import { CalendarDays, CircleUserRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function TaskCard({ task }) {
  const priority = task.priority || "medium";

  return (
    <Link to={`/tasks/${task._id}`} className="task-card">
      <div className="task-card-top">
        <span className={`priority priority-${priority}`}>
          {priority}
        </span>

        <span className="task-status">
          {(task.status || "todo").replace("_", " ")}
        </span>
      </div>

      <h3>{task.title}</h3>

      <p className="task-description">
        {task.description || "No description provided."}
      </p>

      <div className="task-meta">
        <span>
          <CircleUserRound size={15} />
          {task.assignedTo?.name || "Unassigned"}
        </span>

        <span>
          <CalendarDays size={15} />
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "No due date"}
        </span>
      </div>
    </Link>
  );
}