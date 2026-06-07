import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isApproved = user?.isVerifiedStudent && user?.status === "active";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="brand-lockup">
        <span className="brand-mark">SS</span>
        <div className="brand-copy">
          <p className="eyebrow">OLevelStarsBD</p>
          <h1>Student learning space</h1>
          <small>{isApproved ? "Approved learning account" : "Enrollment in progress"}</small>
        </div>
      </div>

      <nav className="top-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        {isApproved ? <NavLink to="/practice">Practice</NavLink> : null}
        {isApproved ? <NavLink to="/live-classes">Live classes</NavLink> : null}
        <NavLink to="/payments">{isApproved ? "Payments" : "Submit payment"}</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>

      <div className="user-actions">
        {isApproved ? <span className="nav-status-pill">Active access</span> : null}
        <div className="user-chip">
          <span>{user?.name?.[0] || "S"}</span>
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.studentId}</p>
          </div>
        </div>
        <button className="button button-secondary" onClick={handleLogout} type="button">
          Log out
        </button>
      </div>
    </header>
  );
}
