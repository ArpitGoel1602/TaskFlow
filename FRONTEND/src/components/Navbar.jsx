
import { Link, useNavigate } from "react-router-dom";
import { CheckSquare, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/dashboard" className="brand">
        <CheckSquare size={26} />
        <span>TaskFlow</span>
      </Link>

      <div className="navbar-right">
        <span className="user-name">
          <UserRound size={17} />
          {user?.name || "User"}
        </span>

        <button className="btn btn-outline" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}