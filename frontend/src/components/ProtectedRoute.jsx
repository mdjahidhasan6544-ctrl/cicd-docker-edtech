import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function getStatusMessage(user) {
  if (user.status === "temp_banned") {
    return "Your account is temporarily blocked because the device limit was exceeded. Contact admin support to reset your device list.";
  }

  if (user.status === "banned") {
    return "Your account has been blocked. Contact admin support if this is unexpected.";
  }

  return "Your account exists, but course access remains locked until an admin verifies your student status.";
}

export default function ProtectedRoute({ children }) {
  const { loading, logout, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="screen-state">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.status === "banned" || user.status === "temp_banned") {
    return (
      <section className="screen-state">
        <div className="state-panel">
          <p className="eyebrow">Account status</p>
          <h1>Access restricted</h1>
          <p>{getStatusMessage(user)}</p>
          <div className="button-row">
            <button className="button button-primary" onClick={logout} type="button">
              Log out
            </button>
          </div>
        </div>
      </section>
    );
  }

  return children || <Outlet />;
}
