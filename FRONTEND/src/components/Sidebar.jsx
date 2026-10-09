
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "My Projects", icon: FolderKanban },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar-heading">WORKSPACE</p>

      <nav>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}