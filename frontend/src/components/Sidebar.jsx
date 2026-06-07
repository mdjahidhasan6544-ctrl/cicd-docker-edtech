import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="brand-mark">SS</span>
        <div>
          <p className="eyebrow">OLevelStarsBD</p>
          <h2>Admin</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin">Overview</NavLink>
        <NavLink to="/admin/students">Students</NavLink>
        <NavLink to="/admin/payments">Payments</NavLink>
        <NavLink to="/admin/courses">Courses</NavLink>
        <NavLink to="/admin/live-classes">Live classes</NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>{user?.email}</p>
        <button className="button button-secondary" onClick={handleLogout} type="button">
          Log out
        </button>
      </div>
    </aside>
  );
}
